import { Component, Fragment } from 'react';

import * as audio from '../audio.js';
import * as etg from '../etg.js';
import * as etgutil from '../etgutil.js';
import * as store from '../store.js';
import * as ui from '../ui.js';

export function Box(props) {
	return (
		<div
			className="bgbox"
			style={{
				position: 'absolute',
				left: props.x + 'px',
				top: props.y + 'px',
				width: props.width + 'px',
				height: props.height + 'px',
			}}>
			{props.children || null}
		</div>
	);
}

export class OnDelay extends Component {
	constructor(props) {
		super(props);
		this._timeout = 0;
	}

	componentDidMount() {
		this._timeout = setTimeout(() => {
			if (this._timeout) {
				this._timeout = 0;
				if (this.props.onTimeout) {
					this.props.onTimeout();
				}
			}
		}, this.props.ms);
	}

	componentWillUnmount() {
		if (this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = 0;
		}
	}

	render() {
		return this.props.children || null;
	}
}

export class Delay extends Component {
	constructor(props) {
		super(props);
		this.state = { on: false };
	}

	render() {
		return (
			<OnDelay ms={this.props.ms} onTimeout={() => this.setState({ on: true })}>
				{this.state.on ? this.props.second : this.props.first}
			</OnDelay>
		);
	}
}

export function CardImage(props) {
	const { card } = props,
		bgcol = ui.maybeLightenStr(card);
	return (
		<div
			className="cardslot"
			onMouseOver={props.onMouseOver}
			onMouseLeave={props.onMouseOut}
			onClick={props.onClick}
			onContextMenu={props.onContextMenu}
			style={{
				backgroundColor: bgcol,
				borderColor: props.opacity ? '#f00' : card.shiny ? '#daa520' : '#222',
				color: card.upped ? '#000' : '#fff',
				...props.style,
			}}>
			{card.name}
			{!!card.cost && (
				<span
					style={{
						position: 'absolute',
						right: '0',
						paddingRight: '2px',
						paddingTop: '2px',
						backgroundColor: bgcol,
					}}>
					{card.cost}
					<span className={'ico te' + card.costele} />
				</span>
			)}
		</div>
	);
}

export class Text extends Component {
	constructor(props) {
		super(props);

		this.state = {
			text: '',
			icoprefix: 'ce',
			elec: null,
		};
	}

	static getDerivedStateFromProps(props, state) {
		let { text, icoprefix = 'ce' } = props;
		text = text ? text.toString() : '';
		if (text === state.text && icoprefix === props.icoprefix) {
			return null;
		}
		const sep = /\d\d?:\d\d?|\$|\n/g;
		const ico = `ico ${icoprefix}`;
		let reres,
			lastindex = 0;
		const elec = [];
		while ((reres = sep.exec(text))) {
			const piece = reres[0];
			if (reres.index !== lastindex) {
				elec.push(
					<Fragment key={elec.length}>
						{text.slice(lastindex, reres.index)}
					</Fragment>,
				);
			}
			if (piece === '\n') {
				elec.push(<br key={elec.length} />);
			} else if (piece === '$') {
				elec.push(<span key={elec.length} className="ico gold" />);
			} else if (/^\d\d?:\d\d?$/.test(piece)) {
				const parse = piece.split(':');
				const num = +parse[0];
				if (num === 0) {
					elec.push(<Fragment key={elec.length}>0</Fragment>);
				} else if (num < 4) {
					const icon = <span className={ico + parse[1]} />;
					for (let j = 0; j < num; j++) {
						elec.push(<Fragment key={elec.length}>{icon}</Fragment>);
					}
				} else {
					elec.push(
						parse[0],
						<span key={elec.length} className={ico + parse[1]} />,
					);
				}
			}
			lastindex = reres.index + piece.length;
		}
		if (lastindex !== text.length) {
			elec.push(<Fragment key={elec.length}>{text.slice(lastindex)}</Fragment>);
		}
		return { text, icoprefix, elec };
	}

	render() {
		return (
			<div className={this.props.className} style={this.props.style}>
				{this.state.elec}
			</div>
		);
	}
}

export function IconBtn(props) {
	return (
		<span
			className={'imgb ico ' + props.e}
			style={{
				position: 'absolute',
				left: props.x + 'px',
				top: props.y + 'px',
			}}
			onClick={e => {
				audio.playSound('click');
				if (props.click) props.click.call(e.target, e);
			}}
			onMouseOver={props.onMouseOver}
		/>
	);
}

export function ExitBtn(props) {
	return (
		<input
			type="button"
			value="Exit"
			onClick={
				props.onClick ||
				(() => {
					store.store.dispatch(store.doNav(import('../views/MainMenu.js')));
				})
			}
			style={{
				position: 'absolute',
				left: props.x + 'px',
				top: props.y + 'px',
			}}
		/>
	);
}

export function Card(props) {
	const { card } = props;
	if (!card) return null;
	const textColor = card.upped ? '#000' : '',
		backColor = ui.maybeLightenStr(card);
	return (
		<div
			style={{
				position: 'absolute',
				left: props.x + 'px',
				top: props.y + 'px',
				width: '160px',
				height: '256px',
				pointerEvents: 'none',
				zIndex: '5',
				color: textColor,
				overflow: 'hidden',
				backgroundColor: backColor,
				borderRadius: '4px',
				borderWidth: '3px',
				borderStyle: 'double',
			}}>
			<span
				style={{
					position: 'absolute',
					left: '2px',
					top: '2px',
					fontSize: '12px',
				}}>
				{card.name}
			</span>
			<img
				className={card.shiny ? 'shiny' : ''}
				src={`/Cards/${etgutil.encodeCode(card.code)}.png`}
				style={{
					position: 'absolute',
					top: '20px',
					left: '8px',
					width: '128px',
					height: '128px',
					borderWidth: '1px',
					borderColor: '#000',
					borderStyle: 'solid',
				}}
			/>
			<Text
				text={card.info()}
				icoprefix="te"
				style={{
					position: 'absolute',
					padding: '2px',
					bottom: '0',
					fontSize: '10px',
					minHeight: '102px',
					backgroundColor: backColor,
					borderRadius: '0 0 4px 4px',
				}}
			/>
			{!!card.rarity && (
				<span
					className={`ico r${card.rarity}`}
					style={{
						position: 'absolute',
						right: '2px',
						top: '40px',
					}}
				/>
			)}
			{!!card.cost && (
				<span
					style={{
						position: 'absolute',
						right: '0',
						paddingRight: '2px',
						paddingTop: '2px',
						fontSize: '12px',
					}}>
					{card.cost}
					<span className={`ico te${card.costele}`} />
				</span>
			)}
			<span
				className={`ico t${card.type}`}
				style={{
					position: 'absolute',
					right: '2px',
					top: '22px',
				}}
			/>
		</div>
	);
}

export function DeckDisplay(props) {
	let mark = -1,
		j = -1;
	const children = [],
		codeCount = [],
		bcodeCount = [];
	for (let i = 0; i < props.deck.length; i++) {
		const code = props.deck[i],
			card = props.cards.Codes[code];
		if (card) {
			j++;
			let opacity;
			if (props.pool && !card.isFree()) {
				const bcode = etgutil.asShiny(etgutil.asUpped(code, 0), 0);
				codeCount[code] = (codeCount[code] ?? 0) + 1;
				bcodeCount[bcode] = (bcodeCount[bcode] ?? 0) + 1;
				if (
					codeCount[code] > (props.pool[code] || 0) ||
					(!card.getStatus('pillar') && bcodeCount[bcode] > 6)
				) {
					opacity = '.5';
				}
			}
			children.push(
				<CardImage
					key={j}
					card={card}
					onMouseOver={props.onMouseOver && (() => props.onMouseOver(i, card))}
					onClick={props.onClick && (() => props.onClick(i, card))}
					style={{
						position: 'absolute',
						left: `${(props.x ?? 0) + 100 + Math.floor(j / 10) * 99}px`,
						top: `${(props.y ?? 0) + 32 + (j % 10) * 19}px`,
						opacity,
					}}
				/>,
			);
		} else {
			const ismark = etgutil.fromTrueMark(code);
			if (~ismark) mark = ismark;
		}
	}
	return (
		<>
			{children}
			{mark !== -1 && props.renderMark && (
				<span
					className={'ico e' + mark}
					style={{
						position: 'absolute',
						left: `${(props.x ?? 0) + 66}px`,
						top: `${(props.y ?? 0) + 188}px`,
					}}
				/>
			)}
		</>
	);
}

export function RaritySelector(props) {
	const children = [];
	for (let i = 0; i < 5; i++) {
		children.push(
			<IconBtn
				key={i}
				e={(i ? 'r' : 't') + i}
				x={props.x}
				y={props.y + i * 24}
				click={() => props.onChange(i)}
			/>,
		);
	}
	return children;
}

export function ElementSelector(props) {
	const children = [];
	for (let i = 0; i < 13; i++) {
		children.push(
			<IconBtn
				key={i}
				e={'e' + i}
				x={!i || i & 1 ? props.x : props.x + 36}
				y={316 + Math.floor((i - 1) / 2) * 32}
				click={() => props.onChange(i)}
			/>,
		);
	}
	return children;
}

function CardSelectorColumn(props) {
	function maybeShiny(card) {
		if (props.filterboth && !props.shiny) {
			const shiny = card.asShiny(true);
			if (
				shiny.code in props.cardpool &&
				props.cardpool[shiny.code] >
					((props.cardminus && props.cardminus[shiny.code]) || 0)
			) {
				return card.asShiny(true);
			}
		}
		return card;
	}
	const children = [],
		countTexts = [];
	for (let j = 0; j < props.cards.length; j++) {
		const y = props.y + j * 19,
			card = props.cards[j],
			code = card.code;
		children.push(
			<CardImage
				key={code}
				style={{
					position: 'absolute',
					left: `${props.x}px`,
					top: `${y}px`,
				}}
				card={card}
				onClick={props.onClick && (() => props.onClick(maybeShiny(card)))}
				onContextMenu={
					props.onContextMenu &&
					(e => {
						e.preventDefault();
						props.onContextMenu(code);
					})
				}
				onMouseOver={
					props.onMouseOver && (() => props.onMouseOver(maybeShiny(card)))
				}
			/>,
		);
		if (props.cardpool) {
			const scode = etgutil.asShiny(code, true);
			const cardAmount = card.isFree()
					? '-'
					: code in props.cardpool
					? props.cardpool[code] -
					  ((props.cardminus && props.cardminus[code]) || 0)
					: 0,
				shinyAmount =
					props.filterboth && !props.shiny && scode in props.cardpool
						? props.cardpool[scode] -
						  ((props.cardminus && props.cardminus[scode]) || 0)
						: 0;
			countTexts.push(
				<div
					key={countTexts.length}
					className={`selectortext ${
						props.maxedIndicator && !card.getStatus('pillar') && cardAmount >= 6
							? cardAmount >= 12
								? ' beigeback'
								: ' lightback'
							: ''
					}`}>
					{cardAmount + (shinyAmount ? '/' + shinyAmount : '')}
				</div>,
			);
		}
	}
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: `${props.x + 100}px`,
					top: `${props.y}px`,
					textHeight: '0',
				}}>
				{countTexts}
			</div>
			{children}
		</>
	);
}
export class CardSelectorCore extends Component {
	state = {};

	static getDerivedStateFromProps(props, state) {
		if (
			props.cards !== state.cards ||
			props.cardpool !== state.cardpool ||
			props.filter !== state.filter ||
			props.element !== state.element ||
			props.rarity !== state.rarity ||
			props.showall !== state.showall ||
			props.shiny !== state.shiny ||
			props.filterboth !== state.filterboth
		) {
			const columns = [];
			for (let i = 0; i < 6; i++) {
				columns.push(
					props.cards.filter(
						i > 2,
						x =>
							(!props.filter || props.filter(x)) &&
							(x.element === props.element || props.rarity === 4) &&
							((i % 3 === 0 && x.type === etg.Creature) ||
								(i % 3 === 1 && x.type <= etg.Permanent) ||
								(i % 3 === 2 && x.type === etg.Spell)) &&
							(!props.cardpool ||
								x.code in props.cardpool ||
								(props.filterboth &&
									etgutil.asShiny(x.code, true) in props.cardpool) ||
								props.showall ||
								x.isFree()) &&
							(!props.rarity || props.rarity === Math.min(x.rarity, 4)),
						props.cards.cardCmp,
						props.shiny && !props.filterboth,
					),
				);
			}

			return {
				cards: props.cards,
				cardpool: props.cardpool,
				filter: props.filter,
				element: props.element,
				rarity: props.rarity,
				showall: props.showall,
				shiny: props.shiny,
				filterboth: props.filterboth,
				columns,
			};
		}
		return null;
	}

	render() {
		const props = this.props;

		return this.state.columns.map((cards, i) => (
			<CardSelectorColumn
				key={i}
				{...props}
				cards={cards}
				x={props.x + i * 133}
				y={props.y}
			/>
		));
	}
}

export class CardSelector extends Component {
	constructor(props) {
		super(props);
		this.state = {
			shiny: false,
			showall: props.showall ?? false,
			element: 0,
			rarity: 0,
		};
	}

	render() {
		return (
			<>
				<input
					type="button"
					value="Toggle Shiny"
					style={{
						position: 'absolute',
						left: '4px',
						top: '578px',
					}}
					onClick={() => this.setState({ shiny: !this.state.shiny })}
				/>
				<input
					type="button"
					value={this.state.showall ? 'Auto Hide' : 'Show All'}
					style={{
						position: 'absolute',
						left: '4px',
						top: '530px',
					}}
					onClick={() => this.setState({ showall: !this.state.showall })}
				/>
				<RaritySelector
					x={80}
					y={338}
					value={this.state.rarity}
					onChange={rarity => this.setState({ rarity })}
				/>
				<ElementSelector
					x={4}
					y={316}
					value={this.state.element}
					onChange={element => this.setState({ element })}
				/>
				<CardSelectorCore
					{...this.props}
					x={100}
					y={272}
					shiny={this.state.shiny}
					showall={this.state.showall}
					rarity={this.state.rarity}
					element={this.state.element}
				/>
			</>
		);
	}
}
