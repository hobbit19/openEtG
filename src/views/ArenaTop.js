'use strict';
const Cards = require('../Cards'),
	Components = require('../Components'),
	sock = require('../sock'),
	store = require('../store'),
	React = require('react');

module.exports = class ArenaTop extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		sock.emit('arenatop', { lv: this.props.lv });
		store.store.dispatch(store.setCmds({
			arenatop: info => this.setState(info),
		}));
	}

	render() {
		const info = this.state.top || [];
		return (
			<>
				<ol
					className="atopol"
					style={{
						position: 'absolute',
						left: '90px',
						top: '50px',
					}}>
					{info.map((data, i) => {
						const lic = [<span className="atoptext">{data[0]}</span>];
						for (let i = 1; i <= 4; i++) {
							if (i == 3) {
								lic.push(<span className="atopdash">-</span>);
							}
							lic.push(<span className={'atop' + i}>{data[i]}</span>);
						}
						const card = Cards.Codes[data[5]].asUpped(this.props.lv);
						lic.push(
							<span
								className="atoptext"
								onMouseEnter={e =>
									this.setState({
										card: card,
										cardx: e.pageX + 4,
										cardy: e.pageY + 4,
									})
								}
								onMouseLeave={() => this.setState({ card: null })}>
								{card.name}
							</span>,
						)
						return <li>{lic}</li>;
					})}
				</ol>
				<Components.ExitBtn x={8} y={300} />
				{this.state.card && (
					<Components.Card
						card={this.state.card}
						x={this.state.cardx}
						y={this.state.cardy}
					/>
				)}
			</>
		);
	}
};