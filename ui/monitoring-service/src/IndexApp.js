import React from 'react';
import alertBell from './assets/audio/alertBell.wav';
import useSound from 'use-sound';
import App from './App';

export default function IndexApp() {
	const [play] = useSound(alertBell);
	return (
		<App play={play} />
	)
}