/** @format */

import {BrowserWindow, IpcMain} from 'electron';
import {getDisplays, setDisplayConfig} from './gpu/DisplayConfig';
import {
	applyOC,
	getSwitchableDynamicGraphicsSettings,
	resetGPU,
	setSwitchableDynamicGraphicsSettings,
} from './gpu/DiscreteGPU';

export const buildGPUListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('resetGPU', async () => {
		let result = await resetGPU();
		if (result) {
			return true;
		} else {
			return false;
		}
	});

	ipc.handle('applyOC', async (event, clocks) => {
		return await applyOC(clocks);
	});

	ipc.handle('getSwitchableDynamicGraphics', async () => {
		let result = await getSwitchableDynamicGraphicsSettings();
		return result;
	});

	ipc.handle('setSwitchableDynamicGraphics', async (event, value: number) => {
		let result = await setSwitchableDynamicGraphicsSettings(value);
		return result;
	});

	ipc.handle('getDisplayOptions', async () => {
		let opts = await getDisplays();
		return opts;
	});

	ipc.handle('setDisplayOptions', async (evt, opts: DisplayOptions) => {
		let result = await setDisplayConfig(
			opts.display,
			opts.refresh,
			opts.width,
			opts.height
		);
		return result;
	});
};
