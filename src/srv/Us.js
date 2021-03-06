import * as pg from './pg.js';

const usergc = new Set();
const userps = new Map();
export const users = new Map();
export const socks = new Map();
export function storeUsers() {
	const queries = [];
	for (const [u, user] of users) {
		if (user.pool || user.accountbound) {
			queries.push(save(user));
		}
	}
	return Promise.all(queries);
}
const usergcloop = setInterval(
	() =>
		storeUsers().then(() => {
			// Clear inactive users
			for (const u of users.keys()) {
				if (usergc.delete(u)) {
					users.delete(u);
				} else {
					usergc.add(u);
				}
			}
		}),
	300000,
);
export function stop() {
	clearInterval(usergcloop);
	return storeUsers();
}
async function _load(name) {
	const result = await pg.pool.query({
		text: `select u.id, u.auth, u.salt, u.iter, u.algo, ud.data from user_data ud join users u on u.id = ud.user_id where u.name = $1 and ud.type_id = 1`,
		values: [name],
	});
	userps.delete(name);
	if (result.rows.length) {
		const user = result.rows[0].data;
		user.name = name;
		user.id = result.rows[0].id;
		user.auth = result.rows[0].auth;
		user.salt = result.rows[0].salt;
		user.iter = result.rows[0].iter;
		user.algo = result.rows[0].algo;
		users.set(name, user);
		if (!user.streak) user.streak = [];
		return user;
	} else {
		throw new Error('User not found');
	}
}

export async function load(name) {
	const userck = users.get(name);
	if (userck) {
		usergc.delete(name);
		return userck;
	} else {
		const userpck = userps.get(name);
		if (userpck) return userpck;
		const p = _load(name);
		userps.set(name, p);
		return p;
	}
}

export function save(user) {
	return pg.pool.query({
		text: `update user_data ud set data = $2 from users u where u.id = ud.user_id and u.name = $1 and ud.type_id = 1`,
		values: [
			user.name,
			{
				...user,
				name: undefined,
				id: undefined,
				auth: undefined,
				salt: undefined,
				iter: undefined,
				algo: undefined,
			},
		],
	});
}
