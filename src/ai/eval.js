import * as etg from '../etg.js';
import Skills from '../Skills.js';
import parseSkill from '../parseSkill.js';

function pillarval(c) {
	return c.type === etg.Spell ? 0.1 : Math.sqrt(c.getStatus('charges'));
}
const SkillsValues = {
	acceleration: 5,
	accretion: 8,
	adrenaline: 8,
	aflatoxin: 5,
	aggroskele: 2,
	alphawolf: c => (c.type === etg.Spell ? 3 : 0),
	animateweapon: 4,
	antimatter: 12,
	appease: c =>
		c.type === etg.Spell
			? -6
			: c.getStatus('appeased')
			? 0
			: c.trueatk() * -1.5,
	bblood: 7,
	beguilestop: c => -getDamage(c.game, c),
	bellweb: 1,
	blackhole: c => {
		let a = 0,
			fq = c.owner.foe.quanta;
		for (let i = 1; i < 13; i++) {
			a += Math.min(fq[i], 3) / 12;
		}
		return a;
	},
	bless: 4,
	boneyard: 3,
	bounce: c => c.card.cost + (c.card.upped ? 1 : 0),
	bravery: c =>
		Math.min(
			4,
			8 - Math.max(c.owner.handIds.length - 1, c.owner.foe.handIds.length),
		),
	brawl: 8,
	brew: 4,
	brokenmirror: c =>
		c.owner.foe.shieldId && c.owner.foe.shield.getStatus('reflective') ? -3 : 2,
	bubbleclear: 3,
	burrow: 1,
	butterfly: 12,
	catapult: 6,
	chimera: 4,
	chromastat: c =>
		1 +
		(c.type === etg.Spell
			? c.card.health + c.card.attack
			: c.trueatk() + c.truehp()) /
			3,
	clear: 2,
	corpseexplosion: 1,
	counter: 3,
	countimmbur: 1,
	cpower: 4,
	cseed: 4,
	cseed2: 4,
	creatureupkeep: c =>
		c.owner.foe.countcreatures() - c.owner.countcreatures() / 2,
	darkness: 1,
	deadalive: 2,
	deathwish: 1,
	deckblast: c => c.owner.deck.length / 2,
	deepdive: (c, ttatk) => (c.type === etg.Spell ? c.card.attack : ttatk / 1.5),
	deepdiveproc: (c, ttatk) => (c.type === etg.Spell ? c.card.attack : ttatk),
	deja: 4,
	deployblobs: c =>
		2 +
		(c.type === etg.Spell
			? Math.min(c.card.attack, c.card.health)
			: Math.min(c.trueatk(), c.truehp())) /
			4,
	destroy: 8,
	destroycard: 1,
	devour: c => 2 + (c.type === etg.Spell ? c.card.health : c.truehp()),
	disarm: c =>
		!c.owner.foe.weapon
			? 0.1
			: c.owner.foe.handIds.length === 8
			? 0.5
			: c.owner.foe.weapon.card.cost,
	disfield: c => {
		let q = 3;
		const perms = c.owner.permanentIds;
		for (let i = 0; i < 16; i++) {
			if (perms[i]) {
				const perm = c.owner.game.byId(perms[i]);
				if (perm.getStatus('pillar')) {
					q +=
						(perm.card.element === etg.Chroma ? 3 : 1) *
						perm.getStatus('charges');
				}
			}
		}

		return q;
	},
	disshield: c => {
		let q = 2;
		const perms = c.owner.permanentIds;
		for (let i = 0; i < 16; i++) {
			if (perms[i]) {
				const perm = c.owner.game.byId(perms[i]);
				if (
					perm.element === etg.Entropy &&
					perm.hasactive('ownattack', 'pillar')
				) {
					q += 3 * perm.getStatus('charges');
				} else if (
					(c.owner.mark === etg.Entropy || perm.element === etg.Entropy) &&
					perm.hasactive('ownattack', 'pend')
				) {
					q +=
						1.5 *
						((c.owner.mark === etg.Entropy) + (perm.element === etg.Entropy)) *
						perm.getStatus('charges');
				}
			}
		}

		return q * 0.8;
	},
	dive: (c, ttatk) =>
		c.type === etg.Spell ? c.card.attack : ttatk - c.getStatus('dive') / 1.5,
	divinity: 3,
	drainlife: 10,
	draft: 1,
	drawcopy: 1,
	drawequip: 2,
	drawpillar: 1,
	dryspell: 5,
	dshield: 4,
	duality: 4,
	earthquake: 4,
	eatspell: 3,
	embezzle: 7,
	empathy: c => c.owner.countcreatures(),
	enchant: 6,
	endow: 4,
	envenom: 3,
	epidemic: 4,
	epoch: 2,
	evolve: 2,
	feed: 6,
	fickle: 3,
	firebolt: 10,
	'firestorm 3': 12,
	flatline: 1,
	flyingweapon: 7,
	foedraw: 8,
	forcedraw: -10,
	forceplay: 2,
	fractal: c => 3 + (9 - c.owner.handIds.length) / 4,
	freedom: 5,
	freeze: [3, 3.5],
	freezeperm: [3.5, 4],
	fungusrebirth: 1,
	gas: 5,
	give: 1,
	golemhit: c => {
		let dmg = 0;
		c.owner.creatures.forEach(cr => {
			if (
				cr &&
				cr.getStatus('golem') &&
				!cr.getStatus('delayed') &&
				!cr.getStatus('frozen')
			) {
				const atk = getDamage(cr.game, cr);
				if (atk > dmg) dmg = atk;
			}
		});
		return dmg;
	},
	gpull: c => (c.type === etg.Spell || c.id !== c.owner.gpull ? 2 : 0),
	gpullspell: 3,
	gratitude: 4,
	grave: 1,
	'growth 1': 2,
	'growth 2': 5,
	'growth 3': 7,
	'growth 1 0': 1,
	'growth 2 0': 3,
	'growth 2 -1': c => 2 + c.truehp(),
	'growth 3 -1': c => 4 + c.truehp(),
	guard: (c, ttatk) => 4 + ttatk + c.getStatus('airborne'),
	halveatk: c => {
		let atk;
		return c.type === etg.Spell
			? -c.card.attack / 4
			: ((atk = c.trueatk()) < 0) - (atk > 0);
	},
	hasten: c => Math.min(c.owner.deck.length / 4, 10),
	hatch: 3,
	heal: c => (c.owner.foe.getStatus('sosa') ? 16 : 8),
	heatmirror: 2,
	hitownertwice: c => (c.type === etg.Spell ? c.card.attack : c.trueatk()) * -2,
	holylight: 3,
	hope: 2,
	icebolt: 10,
	ignite: 4,
	immolate: 5,
	improve: 6,
	inertia: 2,
	infect: 4,
	ink: 3,
	innovation: 3,
	integrity: 4,
	jelly: 5,
	jetstream: 2.5,
	lightning: 7,
	liquid: 5,
	livingweapon: 2,
	lobotomize: 6,
	loot: 2,
	luciferin: 3,
	lycanthropy: 4,
	mend: 3,
	metamorph: 2,
	midas: 6,
	mill: 1,
	millpillar: 1,
	mimic: 3,
	miracle: c => c.owner.maxhp / 8,
	mitosis: c => 4 + c.card.cost,
	mitosisspell: 6,
	momentum: 2,
	mutation: 4,
	neuro: c => (c.owner.foe.getStatus('neuro') ? 4 : 6),
	neuroify: c => (c.owner.foe.getStatus('neuro') ? 2 : 5),
	nightmare: c => {
		const n = c.owner.hand.reduce(
			(n, inst) => n + !!inst.card.isOf(c.game.Cards.Names.Nightmare),
			0,
		);
		return (24 - c.owner.foe.handIds.length) >> n;
	},
	nightshade: 6,
	nova: 4,
	nova2: 6,

	nullspell: 4,
	nymph: 7,
	ouija: 3,
	pacify: 5,
	pairproduce: 2,
	paleomagnetism: [4, 5],
	pandemonium: 3,
	pandemonium2: 4,
	pandemonium3: 5,
	paradox: 5,
	parallel: 8,
	phoenix: 3,
	photosynthesis: 2,
	plague: 5,
	platearmor: 1,
	poisonfoe: 1.4,
	'poison 1': 1,
	'poison 2': 2,
	'poison 3': 3,
	powerdrain: 6,
	precognition: 1,
	predator: (c, tatk) =>
		c.type !== etg.Spell && c.owner.foe.handIds.length > 4
			? tatk + Math.max(c.owner.foe.handIds.length - 6, 1)
			: 1,
	protectonce: 2,
	protectall: 4,
	purify: 2,
	'quanta 4': 1,
	'quanta 6': 1,
	'quanta 8': 1,
	'quanta 9': 1,
	'quanta 12': 1,
	quint: 6,
	quinttog: 7,
	rage: [5, 6],
	readiness: 3,
	reap: 7,
	rebirth: [5, 2],
	reducemaxhp: (c, ttatk) =>
		((ttatk === undefined ? c.card.attack : ttatk) * 5) / 3,
	regenerate: 5,
	regeneratespell: 5,
	regrade: 3,
	reinforce: 0.5,
	ren: 5,
	retain: 6,
	rewind: 6,
	ricochet: 2,
	sadism: 5,
	salvage: 2,
	sanctify: 2,
	scramble: c => {
		let a = 13,
			fq = c.owner.foe.quanta;
		for (let i = 1; i < 13; i++) {
			if (!fq[i]) a--;
		}
		return a / 2;
	},
	serendepity: 4,
	shtriga: 6,
	shuffle3: 7,
	silence: 1,
	singularity: -20,
	sinkhole: 3,
	siphon: 4,
	siphonactive: 3,
	siphonstrength: 4,
	skyblitz: 10,
	snipe: 7,
	sosa: 6,
	soulcatch: 2,
	spores: 4,
	sskin: 5,
	steal: 6,
	steam: 6,
	stoneform: 1,
	'storm 2': 6,
	'storm 3': 12,
	'summon FateEgg': 5,
	'summon Firefly': 6,
	'summon Scarab': 4,
	'summon Shadow': 3,
	'summon Spark': 2,
	'summon Phantom': 3,
	swave: 6,
	tempering: [2, 3],
	tesseractsummon: 8,
	throwrock: 4,
	tick: c => (c.type === etg.Spell ? 1 : 1 + (c.maxhp - c.truehp()) / c.maxhp),
	tornado: 9,
	trick: 4,
	turngolem: c => c.getStatus('storedpower') >> 1,
	unsummon: 1,
	unsummonquanta: 3,
	upkeep: -0.5,
	upload: 3,
	vampire: (c, ttatk) => (c.type === etg.Spell ? c.card.attack : ttatk) * 0.7,
	virtue: c =>
		c.type === etg.Spell
			? c.owner.foe.shield
				? Math.min(c.owner.foe.shield.truedr(), c.card.attack)
				: 0
			: (c.trueatk() - getDamage(c.game, c)) / 1.5,
	virusplague: 1,
	void: 5,
	voidshell: c => (c.owner.maxhp - c.owner.hp) / 10,
	quantagift: 4,
	web: 1,
	wind: c => c.getStatus('storedAtk') / 2 - 2,
	wisdom: 4,
	yoink: 4,
	vengeance: 2,
	vindicate: 3,
	pillar: pillarval,
	pend: pillarval,
	pillmat: pillarval,
	pillspi: pillarval,
	pillcar: pillarval,
	absorber: 5,
	blockwithcharge: c =>
		c.getStatus('charges') / (1 + c.owner.foe.countcreatures() * 2),
	cold: 7,
	despair: 5,
	evade100: c => (!c.getStatus('charges') && c.ownerId === c.game.turn ? 0 : 1),
	'evade 40': 1,
	'evade 50': 1,
	firewall: c =>
		c.owner.foe.creatures.reduce(
			(acc, c) => acc + (c ? Math.log(Math.max(6 - c.hp, 2)) : 0),
			8,
		) / 2,
	chaos: [8, 9],
	skull: 5,
	slow: 6,
	solar: c => {
		const coq = c.owner.quanta[etg.Light];
		return 5 - (4 * coq) / (4 + coq);
	},
	thorn: 5,
	vend: 2,
	weight: 5,
	wings: c => (!c.getStatus('charges') && c.ownerId === c.game.turn ? 0 : 6),
	v_ablaze: 3,
	v_accelerationspell: 5,
	v_acceleration: c => c.truehp() - 2,
	v_accretion: 8,
	v_adrenaline: 8,
	v_aflatoxin: 5,
	v_aggroskele: 2,
	v_animateweapon: 4,
	v_antimatter: 12,
	v_bblood: 7,
	v_blackhole: c => {
		let a = 0;
		const fq = c.owner.foe.quanta;
		for (let i = 1; i < 13; i++) {
			a += Math.min(fq[i], 3) / 12;
		}
		return a;
	},
	v_bless: 4,
	v_boneyard: 3,
	v_bravery: 3,
	v_burrow: 1,
	v_butterfly: 12,
	v_catapult: 6,
	v_chimera: 4,
	v_clear: 2,
	v_corpseexplosion: 1,
	v_counter: 3,
	v_countimmbur: 1,
	v_cpower: 4,
	v_darkness: 1,
	v_deadalive: 2,
	v_deja: 4,
	v_destroy: 8,
	v_devour: c => 2 + (c.type === etg.Spell ? c.card.health : c.truehp()),
	v_disfield: 8,
	v_disshield: 7,
	v_dive: (c, ttatk) =>
		c.type === etg.Spell
			? c.card.attack
			: ttatk - (c.getStatus('dive') || 0) / 1.5,
	v_divinity: 3,
	v_drainlife: 10,
	v_dryspell: 5,
	v_dshield: 4,
	v_duality: 4,
	v_earthquake: 4,
	v_empathy: c => c.owner.countcreatures(),
	v_enchant: 6,
	v_endow: 4,
	v_evolve: 2,
	v_firebolt: 10,
	v_flyingweapon: 7,
	v_fractal: c => 9 - c.owner.hand.length,
	v_freeze: [3, 3.5],
	v_gas: 5,
	v_gpull: c => (c.type === etg.Spell || c.id !== c.owner.gpull ? 2 : 0),
	v_gpullspell: 3,
	v_gratitude: c => (c.status ? c.getStatus('charges') * 4 : 4),
	v_growth1: 3,
	v_growth: 5,
	v_guard: 4,
	v_hasten: c => Math.min(c.owner.deck.length / 4, 10),
	v_hatch: 3,
	v_heal: c => (c.owner.foe.getStatus('sosa') ? 16 : 8),
	v_holylight: 3,
	v_hope: 2,
	v_icebolt: 10,
	v_ignite: 4,
	v_immolate: 5,
	v_improve: 6,
	v_inertia: 2,
	v_infect: 4,
	v_integrity: 4,
	v_lightning: 7,
	v_liquid: 5,
	v_lobotomize: 6,
	v_luciferin: 3,
	v_lycanthropy: 4,
	v_mend: 3,
	v_miracle: c => c.owner.maxhp / 8,
	v_mitosis: c => 4 + c.card.cost,
	v_mitosisspell: 6,
	v_momentum: 2,
	v_mutation: 4,
	v_neuro: c => (c.owner.foe.neuro ? 2.1 : 6),
	v_nightmare: c => {
		const n = c.owner.hand.reduce(
			(n, inst) => n + !!inst.card.isOf(c.game.Cards.Names.Nightmare),
			0,
		);
		return (24 - c.owner.foe.handIds.length) >> n;
	},
	v_nova: 4,
	v_nova2: 6,
	v_nymph: 7,
	v_ouija: 3,
	v_overdrive: c => c.truehp() - 1,
	v_overdrivespell: 5,
	v_pandemonium: 3,
	v_pandemonium2: 4,
	v_paradox: 5,
	v_parallel: 8,
	v_phoenix: 3,
	v_photosynthesis: 2,
	v_plague: 5,
	v_platearmor: 1,
	v_poison: 2,
	v_poison2: 3,
	v_poison3: 4,
	v_precognition: 1,
	v_purify: 2,
	v_queen: 7,
	v_quint: 6,
	v_rage: [5, 6],
	v_readiness: 3,
	v_rebirth: [5, 2],
	v_regenerate: 5,
	v_rewind: 6,
	v_salvage: 2,
	v_sanctuary: 6,
	v_scarab: 4,
	v_scramble: c => {
		let a = 0,
			fq = c.owner.foe.quanta;
		for (let i = 1; i < 13; i++) {
			if (!fq[i]) a++;
		}
		return a;
	},
	v_serendipity: 4,
	v_silence: 1,
	v_singularity: -20,
	v_siphon: 4,
	v_skyblitz: 10,
	v_snipe: 7,
	v_sosa: 6,
	v_soulcatch: 2,
	v_sskin: 5,
	v_steal: 6,
	v_steam: 6,
	v_stoneform: 1,
	v_storm2: 6,
	v_storm3: 12,
	v_swave: 6,
	v_upkeep: -0.5,
	v_vampire: (c, ttatk) => (c.type === etg.Spell ? c.card.attack : ttatk) * 0.7,
	v_virusplague: 1,
	v_void: c => (c.status ? c.getStatus('charges') * 5 : 5),
	v_web: 1,
	v_wisdom: 4,
	v_pillar: pillarval,
	v_pend: pillarval,
	v_blockwithcharge: c =>
		c.getStatus('charges') / (1 + c.owner.foe.countcreatures() * 2),
	v_cold: 7,
	v_evade100: c =>
		c.status
			? c.getStatus('charges') === 0 && c.owner === c.owner.game.turn
				? 0
				: 1
			: 1,
	v_evade40: 1,
	v_evade50: 1,
	v_firewall: 7,
	v_skull: 5,
	v_slow: 6,
	v_solar: c => {
		const coq = c.owner.quanta[etg.Light];
		return 5 - (4 * coq) / (4 + coq);
	},
	v_thorn: 5,
	v_weight: 5,
	v_wings: c =>
		c.status
			? c.getStatus('charges') === 0 && c.owner === c.owner.game.turn
				? 0
				: 6
			: 6,
};
const statusValues = {
	airborne: 0.2,
	ranged: 0.2,
	voodoo: 1,
	swarm: 1,
	tunnel: 3,
	cloak: c => (!c.getStatus('charges') && c.ownerId === c.game.turn ? 0 : 4),
	patience: c => 1 + c.owner.countcreatures() * 2,
	reflective: 1,
	// oetg-v
	freedom: c => Math.min(c.getStatus('charges'), 4) * 5 || 5,
};

function getDamage(game, c) {
	return damageHash.get(c.id) ?? 0;
}
function estimateDamage(
	game,
	c,
	freedomChance,
	wallIndex,
	wallCharges,
	disShield,
	disField,
) {
	if (!c || c.getStatus('frozen') || c.getStatus('delayed')) {
		return 0;
	}
	const tatk = c.trueatk(),
		fsh = c.owner.foe.shield,
		fshactive = fsh && fsh.active.get('shield'),
		momentum =
			!fsh ||
			tatk <= 0 ||
			c.getStatus('momentum') ||
			c.getStatus('psionic') ||
			(c.getStatus('burrowed') &&
				c.owner.permanents.some(pr => pr && pr.getStatus('tunnel'))),
		dr = momentum ? 0 : fsh.truedr();
	function estimateAttack(tatk) {
		const data = { dmg: tatk, blocked: 0 };
		if (momentum) {
			return tatk;
		}
		if (
			fshactive &&
			(~fshactive.name.indexOf('weight') ||
				~fshactive.name.indexOf('wings') ||
				~fshactive.name.indexOf('v_weight') ||
				~fshactive.name.indexOf('v_wings')) &&
			(fshactive.func(game, c.owner.foe.shield, c, data) || !data.dmg)
		) {
			return 0;
		} else if (wallCharges[wallIndex]) {
			wallCharges[wallIndex]--;
			return 0;
		} else if (disShield[wallIndex] > 0) {
			disShield[wallIndex] -= Math.ceil(tatk / 3);
			return 0;
		} else if (disField[wallIndex] > 0) {
			disField[wallIndex] -= tatk;
			return 0;
		}
		return Math.max(tatk - dr, 0);
	}
	let atk = estimateAttack(tatk);
	if (c.getStatus('adrenaline')) {
		const attacks = etg.countAdrenaline(tatk);
		while (c.getStatus('adrenaline') < attacks) {
			c.incrStatus('adrenaline', 1);
			atk += estimateAttack(c.trueatk());
		}
		c.setStatus('adrenaline', 1);
	}
	if (!momentum && fshactive) {
		atk *=
			~fshactive.name.indexOf('evade100') ||
			~fshactive.name.indexOf('v_evade100')
				? 0
				: ~fshactive.name.indexOf('evade 50') ||
				  ~fshactive.name.indexOf('v_evade50')
				? 0.5
				: ~fshactive.name.indexOf('evade 40') ||
				  ~fshactive.name.indexOf('v_evade40')
				? 0.6
				: ~fshactive.name.indexOf('chaos') && fsh.card.upped
				? 0.8
				: 1;
	}
	if (!fsh && freedomChance && c.getStatus('airborne')) {
		atk += Math.ceil(atk / 2) * freedomChance;
	}
	if (c.owner.foe.getStatus('sosa')) atk *= -1;
	damageHash.set(c.id, atk);
	return atk;
}
function calcExpectedDamage(pl, wallIndex, wallCharges, disShield, disField) {
	let totalDamage = 0,
		stasisFlag = false,
		freedomChance = 0;
	const plpermanents = pl.permanents,
		foepermanents = pl.foe.permanents;
	for (let i = 0; i < 16; i++) {
		let p;
		if ((p = plpermanents[i])) {
			if (
				!stasisFlag &&
				(p.hasactive('attack', 'stasis') || p.hasactive('attack', 'patience'))
			) {
				stasisFlag = true;
			} else if (p.hasactive('attack', 'freedom')) {
				freedomChance++;
			}
		}
		if (
			!stasisFlag &&
			(p = foepermanents[i]) &&
			p.hasactive('attack', 'stasis')
		) {
			stasisFlag = true;
		}
	}
	if (freedomChance) freedomChance = 1 - 0.7 ** freedomChance;
	if (!stasisFlag) {
		pl.creatures.forEach(c => {
			if (c) {
				const dmg = estimateDamage(
					pl.game,
					c,
					freedomChance,
					wallIndex,
					wallCharges,
					disShield,
					disField,
				);
				if (
					!(
						c.getStatus('psionic') &&
						pl.foe.shieldId &&
						pl.foe.shield.getStatus('reflective')
					)
				)
					totalDamage += dmg;
			}
		});
	}
	return (
		totalDamage +
		estimateDamage(
			pl.game,
			pl.weapon,
			freedomChance,
			wallIndex,
			wallCharges,
			disShield,
			disField,
		) +
		pl.foe.getStatus('poison')
	);
}

function evalactive(c, active, extra) {
	let sum = 0;
	for (let i = 0; i < active.name.length; i++) {
		const aval = SkillsValues[active.name[i]];
		sum +=
			aval === undefined
				? 0
				: aval instanceof Function
				? aval(c, extra)
				: aval instanceof Array
				? aval[c.card.upped ? 1 : 0]
				: aval;
	}
	return sum;
}

function checkpassives(c) {
	let score = 0;
	for (const [status, val] of c.status) {
		// Skip cloak if it expires at end of turn
		if (
			val &&
			uniqueStatuses.has(status) &&
			c.type !== etg.Spell &&
			!(
				status === 'cloak' &&
				!c.getStatus('charges') &&
				c.ownerId === c.game.turn
			)
		) {
			if (uniquesSkill.has(status)) {
				continue;
			}
			uniquesSkill.add(status);
		}
		const sval = statusValues[status];
		score += !sval ? 0 : sval instanceof Function ? sval(c) : sval;
	}
	for (const [status, type] of uniqueSkills) {
		if (c.type !== etg.Spell && c.hasactive(type, status)) {
			if (uniquesSkill.has(status)) {
				continue;
			}
			uniquesSkill.add(status);
			const sval = statusValues[status];
			score += !sval ? 0 : sval instanceof Function ? sval(c) : sval;
		}
	}
	return score;
}

const throttled = new Set([
	'poison 1',
	'poison 2',
	'poison 3',
	'neuro',
	'regen',
	'siphon',
]);

function evalthing(game, c, inHand = false, floodingFlag = false) {
	if (!c) return 0;
	const { card } = c;
	if (inHand && !caneventuallyactive(card.costele, card.cost, c.owner)) {
		return card.active.get('discard') !== Skills.obsession
			? 0
			: card.upped
			? -7
			: -6;
	}
	if (inHand && card.type === etg.Spell) {
		return evalactive(c, card.active.get('cast'));
	}
	let ttatk,
		hp,
		poison,
		ctrueatk,
		score = 0;
	const isCreature = (inHand ? card : c).type === etg.Creature,
		isAttacker = isCreature || (inHand ? card : c).type === etg.Weapon,
		adrenalinefactor = c.getStatus('adrenaline')
			? etg.countAdrenaline(ctrueatk)
			: 1,
		delaymix =
			Math.max(c.getStatus('frozen'), c.getStatus('delayed')) /
			adrenalinefactor,
		delayfactor = delaymix ? 1 - Math.min(delaymix / 5, 0.6) : 1;
	if (isAttacker) {
		ctrueatk = c.trueatk();
		ttatk = getDamage(game, c);
		if (
			c.getStatus('psionic') &&
			c.owner.foe.shieldId &&
			c.owner.foe.shield.getStatus('reflective')
		)
			ttatk *= -1;
		score += ttatk + ctrueatk / (10 + delayfactor);
	} else {
		ttatk = 0;
	}
	if (isCreature) {
		hp = Math.max(c.truehp(), 0);
		poison = c.getStatus('poison');
		if (poison > 0) {
			hp = Math.max(hp - poison * 2, 0);
			if (c.getStatus('aflatoxin')) score -= 2;
		} else if (poison < 0) {
			hp = Math.max(Math.min(hp - poison, c.maxhp), 0);
		}
		if (
			floodingFlag &&
			!c.getStatus('aquatic') &&
			c.isMaterial() &&
			c.getIndex() > 4
		)
			hp = 0;
		if (hp === 0) {
			if (c.active.get('owndeath')) {
				score += evalactive(c, c.active.get('owndeath'), ttatk) * 3;
			}
			for (let j = 0; j < 2; j++) {
				const pl = j ? c.owner : c.owner.foe;
				score +=
					pl.creatures.reduce(
						(acc, cr) =>
							acc +
							(cr && cr.active.get('death')
								? evalactive(cr, cr.active.get('death'), ttatk) * (j ? 3 : -3)
								: 0),
						0,
					) +
					pl.permanents.reduce(
						(acc, pr) =>
							acc +
							(pr && pr.active.get('death')
								? evalactive(pr, pr.active.get('death'), ttatk) * (j ? 3 : -3)
								: 0),
						0,
					);
			}
		}
	}
	const throttlefactor =
		adrenalinefactor < 3 ||
		(isCreature && c.owner.weapon && c.owner.weapon.getStatus('nothrottle'))
			? adrenalinefactor
			: 2;
	for (const [key, act] of c.active) {
		const adrfactor = throttled.has(key) ? throttlefactor : adrenalinefactor;
		if (key === 'hit') {
			score +=
				evalactive(c, act, ttatk) *
				(ttatk ? 1 : c.getStatus('immaterial') ? 0 : 0.3) *
				adrfactor *
				delayfactor;
		} else if (key === 'ownattack') {
			if (!c.getStatus('frozen')) {
				score += evalactive(c, act, ttatk) * adrfactor;
			}
		} else if (key === 'cast') {
			if (caneventuallyactive(c.castele, c.cast, c.owner)) {
				score += evalactive(c, act, ttatk) * delayfactor;
			}
		} else if (key !== (isCreature ? 'shield' : 'owndeath')) {
			score += evalactive(c, act);
		}
	}
	score += checkpassives(c);
	if (isCreature) {
		if (c.getStatus('voodoo') && c.isMaterial()) {
			score += hp / 10;
		}
		if (hp !== 0 && c.owner.gpull === c.id) {
			if (c.getStatus('voodoo')) score += hp;
			score = ((score + hp) * Math.log(hp)) / 4;
			if (c.active.get('shield') && !delaymix) {
				score += evalactive(c, c.active.get('shield'));
			}
		} else {
			score *=
				hp !== 0
					? !c.isMaterial()
						? 1.3
						: 1 + Math.log(Math.min(hp, 33)) / 7
					: inHand
					? 0.4
					: 0.2;
		}
	} else {
		score *= c.getStatus('immaterial') ? 1.35 : 1.25;
	}
	if (inHand) score *= 0.9;
	return score;
}

function caneventuallyactive(element, cost, pl) {
	return (
		cost <= 0 ||
		!element ||
		pl.quanta[element] > 0 ||
		!pl.mark ||
		pl.mark === element ||
		pl.permanents.some(
			pr =>
				pr &&
				((pr.getStatus('pillar') &&
					(!pr.card.element || pr.card.element === element)) ||
					(pr.active.get('cast') === Skills.locket &&
						pr.getStatus('mode') === element)),
		)
	);
}

const uniqueStatuses = new Set(['nightfall', 'tunnel', 'cloak']),
	uniqueSkills = new Map([
		['flooddeath', 'attack'],
		['patience', 'attack'],
	]),
	uniquesSkill = new Set(),
	damageHash = new Map();

export default function (game) {
	const player = game.byId(game.turn),
		playerIdx = player.getIndex(),
		foe = player.foe;
	if (game.winner) {
		return game.winner === player.id ? 99999999 : -99999999;
	}
	if (foe.deckIds.length === 0 && foe.handIds.length < 8) {
		return 99999990;
	}
	const wallCharges = new Int32Array(game.players.length),
		disShield = new Int32Array(game.players.length),
		disField = new Int32Array(game.players.length);
	damageHash.clear();
	uniquesSkill.clear();
	const expectedDamage = new Map();
	for (let j = 0; j < game.players.length; j++) {
		const pl = game.byId(game.players[(playerIdx + j) % game.players.length]);
		if (pl.shieldId) {
			if (pl.shield.hasactive('shield', 'blockwithcharge')) {
				wallCharges[j] = pl.shield.getStatus('charges');
			} else if (pl.shield.hasactive('shield', 'disshield')) {
				disShield[j] = pl.quanta[etg.Entropy];
			} else if (pl.shield.hasactive('shield', 'disfield')) {
				let q = 0;
				for (let i = 1; i < 13; i++) q += pl.quanta[i];
				disField[j] = q;
			}
		}
	}
	for (let j = 0; j < game.players.length; j++) {
		const pl = game.byId(game.players[(playerIdx + j) % game.players.length]);
		expectedDamage.set(
			pl.id,
			calcExpectedDamage(
				pl,
				pl.foe.getIndex(),
				wallCharges,
				disShield,
				disField,
			),
		);
	}
	if (expectedDamage.get(player.id) > foe.hp) {
		return (expectedDamage.get(player.id) - foe.hp) * 999;
	}
	if (player.deckIds.length === 0 && player.handIds.length < 8) {
		return -99999980;
	}
	let floodingFlag = false;
	for (let j = 0; j < game.players.length; j++) {
		const pl = game.byId(game.players[(playerIdx + j) % game.players.length]),
			perms = pl.permanents;
		for (let i = 0; i < 16; i++) {
			const perm = perms[i];
			if (perm && perm.hasactive('attack', 'flooddeath')) {
				floodingFlag = true;
				break;
			}
		}
		if (floodingFlag) break;
	}
	let gamevalue = 0;
	for (let j = 0; j < game.players.length; j++) {
		if (j) {
			// Reset non global effects
			uniquesSkill.delete('tunnel');
			uniquesSkill.delete('patience');
			uniquesSkill.delete('cloak');
		}
		const pl = game.byId(game.players[(playerIdx + j) % game.players.length]);
		if (pl.out) continue;
		const expectedDamageToTake = expectedDamage.get(pl.foeId);
		let pscore =
			wallCharges[j] * 4 + Math.log(pl.markpower + 1) - expectedDamageToTake;
		if (expectedDamageToTake >= pl.hp)
			pscore -= (expectedDamageToTake - pl.hp) * 99 + 33;
		pscore += evalthing(game, pl.weapon) + evalthing(game, pl.shield);
		for (const cr of pl.creatures)
			pscore += evalthing(game, cr, false, floodingFlag);
		for (const pr of pl.permanents) pscore += evalthing(game, pr);
		for (const cinst of pl.hand) pscore += evalthing(game, cinst, true);
		for (let draw = 1; draw <= pl.drawpower; draw++) {
			if (
				pl.id !== game.turn &&
				pl.handIds.length + draw <= 8 &&
				pl.deckIds.length >= draw
			) {
				pscore += evalthing(
					game,
					game.byId(pl.deckIds[pl.deckIds.length - draw]),
					true,
				);
			}
		}
		pscore += Math.sqrt(Math.max(pl.hp, 0)) * 4 - pl.getStatus('poison');
		if (pl.getStatus('precognition')) pscore += 0.5;
		if (pl.casts === 0)
			pscore -= (pl.handIds.length + (pl.handIds.length > 6 ? 7 : 4)) / 4;
		if (pl.getStatus('flatline')) pscore -= 2;
		if (pl.getStatus('neuro')) pscore -= 5 + pl.handIds.length / 2;
		gamevalue += pscore * (pl.leader === player.leader ? 1 : -1);
	}
	return gamevalue;
}
