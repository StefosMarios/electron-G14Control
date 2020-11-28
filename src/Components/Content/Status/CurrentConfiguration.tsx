/** @format */

import { message, Table } from 'antd';
import { isNull } from 'lodash';
import React, { Component } from 'react';
import { store } from '../../../Store/ReduxStore';

interface Props {}

interface State {
	fanCurve: string;
	ryzenadj: string;
	boost: string;
	needsUpdate: boolean;
	windowsPlan: { name: string; guid: string };
	graphics: { ac: number; dc: number };
}

const dynamicGraphicsOptions = [
	'Force power-saving graphics',
	'Optimize power savings',
	'Optimize performance',
	'Maximize performance',
];

export default class CurrentConfiguration extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let { current } = store.getState() as G14Config;

		this.state = {
			needsUpdate: false,
			ryzenadj: current.ryzenadj,
			fanCurve: current.fanCurve,
			boost: '',
			windowsPlan: {
				name: '',
				guid: '',
			},
			graphics: {
				ac: 0,
				dc: 0,
			},
		};
	}

	componentDidMount() {
		let { windowsPlan, boost } = this.state;
		window.ipcRenderer
			.invoke('getActivePlan')
			.then((result: { name: string; guid: string } | false) => {
				if (result) {
					windowsPlan = result;
					window.ipcRenderer
						.invoke('getBoost', windowsPlan.guid)
						.then(
							async (
								resultboost:
									| { guid: string; boost: { ac: number; dc: number } }
									| false
							) => {
								if (resultboost && !isNull(resultboost.boost.ac)) {
									boost = [
										'Disabled',
										'',
										'Aggressive',
										'',
										'Efficient Aggressive',
									][resultboost.boost.ac];
									this.setState({ windowsPlan, boost });
								} else {
									this.setState({ windowsPlan });
									message.error(
										"Couldn't load current boost for active Windows power plan."
									);
								}
							}
						);
				} else {
					message.error("Couldn't load current Windows power plan.");
				}
			});
		window.ipcRenderer.invoke('getSwitchableDynamicGraphics').then(
			(
				response:
					| {
							plan: { name: string; guid: string };
							result: { ac: number; dc: number };
					  }
					| false
			) => {
				if (response) {
					this.setState({ graphics: response.result });
				} else {
					message.error(
						'There was trouble finding switchable dynamic graphics settings.'
					);
				}
			}
		);
	}

	render() {
		let tableColumns = [
			{
				dataIndex: 'name',
				title: 'Setting Type',
			},
			{
				dataIndex: 'value',
				title: 'Chosen Setting',
			},
		];
		let { ryzenadj, fanCurve, boost, windowsPlan, graphics } = this.state;
		return (
			<>
				<Table
					size="small"
					showHeader
					columns={tableColumns}
					pagination={false}
					bordered
					dataSource={[
						{ name: 'CPU Tuning', value: ryzenadj },
						{ name: 'Fan Curve', value: fanCurve },
						{ name: 'Windows Power Plan', value: windowsPlan.name },
						{ name: 'Boost Mode', value: boost },
						{
							name: 'Graphics Preference',
							value: dynamicGraphicsOptions[graphics.ac],
						},
					]}></Table>
			</>
		);
	}
}
