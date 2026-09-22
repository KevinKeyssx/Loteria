import { mount } from 'svelte';
import './styles.css';
import App from './App.svelte';

const targetElement: HTMLElement | null = document.getElementById( 'app' );

if ( !targetElement ) {
	throw new Error( 'No se encontró el elemento raíz #app en el DOM.' );
}

const app = mount( App, ({ target: targetElement }) );

export default app;
