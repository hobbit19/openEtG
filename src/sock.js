const Cards = require('./Cards'),
	etgutil = require('./etgutil'),
	Game = require('./Game'),
	store = require('./store'),
	userutil = require('./userutil'),
	RngMock = require('./RngMock'),
	React = require('react');
const endpoint =
	(location.protocol === 'http:' ? 'ws://' : 'wss://') +
	location.hostname +
	':13602';
const buffer = [];
let socket = new WebSocket(endpoint),
	attempts = 0,
	attemptTimeout = 0;
const sockEvents = {
	clear: () => store.store.dispatch(store.clearChat('Main')),
	passchange: data => {
		store.store.dispatch(store.updateUser({ auth: data.auth }));
		store.store.dispatch(store.chatMsg('Password updated', 'System'));
	},
	mute: data => {
		store.store.dispatch(store.mute(data.m));
		store.store.dispatch(store.chatMsg(data.m + ' has been muted', 'System'));
	},
	roll: data => {
		store.store.dispatch(
			store.chat(
				<div style={{ color: '#090' }}>
					{data.u && <b>{data.u} </b>}
					{data.A || 1}d{data.X}{' '}
					<a href={`speed/${data.sum}`} target="_blank">
						{data.sum}
					</a>
				</div>,
				'Main',
			),
		);
	},
	chat: data => {
		const state = store.store.getState();
		if (state.opts.muteall) {
			if (!data.mode) return;
		} else if (
			typeof Notification !== 'undefined' &&
			Notification.permission !== 'denied' &&
			state.user &&
			~data.msg.indexOf(state.user.name) &&
			!document.hasFocus()
		) {
			Notification.requestPermission().then(result => {
				if (result == 'granted') new Notification(data.u, { body: data.msg });
			});
		}
		const now = new Date(),
			h = now.getHours(),
			m = now.getMinutes(),
			hs = h < 10 ? '0' + h : h.toString(),
			ms = m < 10 ? '0' + m : m.toString(),
			style = {},
			text = [];
		if (data.mode != 1) style.color = data.mode == 2 ? '#69f' : '#ddd';
		if (data.guest) style.fontStyle = 'italic';
		let decklink = /\b(([01][0-9a-v]{4})+)\b/g,
			reres,
			lastindex = 0;
		while ((reres = decklink.exec(data.msg))) {
			if (reres.index != lastindex)
				text.push(data.msg.slice(lastindex, reres.index));
			let notlink = false;
			for (let i = 2; i < reres[0].length; i += 5) {
				const code = parseInt(reres[0].substr(i, 3), 32);
				if (!(code in Cards.Codes) && etgutil.fromTrueMark(code) == -1) {
					notlink = true;
					break;
				}
			}
			if (notlink) {
				lastindex = reres.index;
				continue;
			}
			text.push(
				<a href={`deck/${reres[0]}`} target="_blank">
					{reres[0]}
				</a>,
			);
			lastindex = reres.index + reres[0].length;
		}
		if (lastindex != data.msg.length) text.push(data.msg.slice(lastindex));
		store.store.dispatch(
			store.chat(
				<div style={style}>
					{`${hs}${ms} `}
					{data.u && <b>{data.u} </b>}
					{text}
				</div>,
				data.mode == 1 ? null : 'Main',
			),
		);
	},
	foearena: data => {
		const { user } = store.store.getState();
		const game = new Game({
			players: RngMock.shuffle([
				{
					idx: 1,
					name: user && user.name,
					user: user ? user.name : '',
					deck: exports.getDeck(),
				},
				{
					idx: 2,
					ai: 1,
					name: data.name,
					deck: data.deck,
					hp: data.hp,
					drawpower: data.draw,
					markpower: data.mark,
				},
			]),
			seed: data.seed,
			rank: data.rank,
			age: data.age,
			arena: data.name,
			level: 4 + data.lv,
			cost: userutil.arenaCost(data.lv),
			rematch: () => {
				const { user } = store.store.getState();
				if (!Cards.isDeckLegal(etgutil.decodedeck(exports.getDeck()), user)) {
					store.store.dispatch(store.chatMsg(`Invalid deck`, 'System'));
					return;
				}
				const cost = userutil.arenaCost(data.lv);
				if (user.gold < cost) {
					store.store.dispatch(store.chatMsg(`Requires ${cost}$`, 'System'));
					return;
				}
				exports.userEmit('foearena', { lv: data.lv });
			},
		});
		store.store.dispatch(store.doNav(require('./views/Match'), { game }));
	},
	tradegive: data => {
		if (exports.trade) {
			delete exports.trade;
			store.store.dispatch(store.doNav(require('./views/Trade')));
		}
	},
	pvpgive: data => {
		if (exports.pvp) {
			delete exports.pvp;
			store.store.dispatch(
				store.doNav(require('./views/Match'), { game: new Game(data.data) }),
			);
		}
	},
	spectategive: data => {
		if (exports.spectate) {
			delete exports.spectate;
			data.spectate = true;
			store.store.dispatch(
				store.doNav(require('./views/Match'), { game: new Game(data.data) }),
			);
		}
	},
	matchinvite: data => {
		store.store.dispatch(
			store.chat(
				<div
					style={{ cursor: 'pointer', color: '#69f' }}
					onClick={() => {
						store.store.dispatch(store.doNav(require('./views/Challenge')));
						exports.userEmit('matchjoin', { host: data.u });
					}}>
					{`${data.u} invites you`}
				</div>,
			),
		);
	},
	challenge: data => {
		store.store.dispatch(
			store.chat(
				<div
					style={{ cursor: 'pointer', color: '#69f' }}
					onClick={() => {
						if (data.pvp) {
							exports.sendChallenge((exports.pvp = data.f));
						} else {
							exports.userEmit('tradewant', { f: (exports.trade = data.f) });
						}
					}}>
					{`${data.f} offers to ${data.pvp ? 'duel' : 'trade with'} you!`}
				</div>,
			),
		);
		exports.emit('challrecv', { f: data.f, pvp: data.pvp });
	},
	bzgive: data => {
		store.store.dispatch(store.userCmd(data.g ? 'addgold' : 'addcards', data));
		store.store.dispatch(store.chatMsg(data.msg, 'System'));
	},
};
socket.onmessage = function(msg) {
	const state = store.store.getState();
	const data = JSON.parse(msg.data);
	if (data.u && state.muted.has(data.u)) return;
	const func = sockEvents[data.x] || state.cmds[data.x];
	if (func) func.call(this, data);
};
socket.onopen = function() {
	attempts = 0;
	if (attemptTimeout) {
		clearTimeout(attemptTimeout);
		attemptTimeout = 0;
	}
	const { opts } = store.store.getState();
	if (opts.offline || opts.wantpvp || opts.afk)
		exports.emit({
			x: 'chatus',
			hide: !!opts.offline,
			wantpvp: !!opts.wantpvp,
			afk: !!opts.afk,
		});
	buffer.forEach(this.send, this);
	buffer.length = 0;
	store.store.dispatch(store.chatMsg('Connected', 'System'));
};
socket.onclose = function() {
	if (attemptTimeout) return;
	if (attempts < 8) attempts++;
	const timeout = 99 + Math.floor(99 * Math.random()) * attempts;
	attemptTimeout = setTimeout(() => {
		attemptTimeout = 0;
		const oldsock = socket;
		socket = new WebSocket(endpoint);
		socket.onopen = oldsock.onopen;
		socket.onclose = oldsock.onclose;
		socket.onmessage = oldsock.onmessage;
	}, timeout);
	store.store.dispatch(store.chatMsg(`Reconnecting in ${timeout}ms`, 'System'));
};
exports.userEmit = function(x, data = {}) {
	const { user } = store.store.getState();
	data.x = x;
	data.u = user.name;
	data.a = user.auth;
	exports.emit(data);
};
exports.emit = function(data) {
	const msg = JSON.stringify(data);
	if (socket && socket.readyState == 1) {
		socket.send(msg);
	} else {
		buffer.push(msg);
	}
};
exports.userExec = function(x, data = {}) {
	exports.userEmit(x, data);
	store.store.dispatch(store.userCmd(x, data));
};
exports.getDeck = function() {
	const state = store.store.getState();
	return state.user
		? state.user.decks[state.user.selectedDeck] || ''
		: state.opts.deck;
};
exports.sendChallenge = function(foe) {
	const deck = exports.getDeck(),
		{ user } = store.store.getState();
	if (!Cards.isDeckLegal(etgutil.decodedeck(deck), user)) {
		store.store.dispatch(store.chatMsg(`Invalid deck`, 'System'));
		return;
	}
	const msg = { f: foe };
	exports.userEmit('foewant', msg);
	exports.pvp = foe;
};
