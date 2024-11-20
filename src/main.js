import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"

// SETUP

const canvas = document.getElementById( "map" )
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x202020 )
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight )
camera.position.set( 100, 100, 100 )
camera.lookAt( 0, 0, 0 )
const controls = new MapControls( camera, canvas )
controls.enableDamping = true
controls.zoomToCursor = true
const renderer = new THREE.WebGLRenderer( { canvas } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight )

window.addEventListener( "resize", () => {

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize( window.innerWidth, window.innerHeight )
} )

// RENDER

renderer.setAnimationLoop( () => {
	controls.update()
	renderer.render( scene, camera )
} )

// HELPERS

scene.add( new THREE.GridHelper( 100, 20, 0x808080, 0x404040 ) )
scene.add( new THREE.AxesHelper( 2_000 ) )
