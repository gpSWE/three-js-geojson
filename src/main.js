import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"

import { geoMercator } from "d3-geo"
import earcut, { flatten } from "earcut"

const mercator = geoMercator().translate( [ 0, 0 ] ).scale( 1_000_000 ).center( [ 69.25364105104285, 41.315424278113454 ] )

// SETUP

const canvas = document.getElementById( "map" )
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x202020 )
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 100_000 )
camera.position.set( 0, 200, 0 )
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

// scene.add( new THREE.GridHelper( 100, 100, 0x808080, 0x404040 ) )
scene.add( new THREE.AxesHelper( 2_000 ) )

// WORLD

main()

async function main() {

	const geoJSONFeatureCollection = await ( await fetch( "/collection.json" ) ).json()

	for ( const geoJSONFeature of geoJSONFeatureCollection.features ) {

		if ( geoJSONFeature.geometry.type === "Polygon" ) {

			const { coordinates } = geoJSONFeature.geometry

			const f = flatten( coordinates )
			const indices = earcut( f.vertices, f.holes, 2 )

			const vertices = []

			for ( const [ lon, lat ] of coordinates.flat() ) {

				const [ x, z ] = mercator( [ lon, lat ] )

				vertices.push( x, 0, z )
			}

			const geometry = new THREE.BufferGeometry()
			geometry.setIndex( indices )
			geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )

			const material = new THREE.MeshBasicMaterial( {} )
			const object = new THREE.Mesh( geometry, material )

			scene.add( object )
		}
		else if ( geoJSONFeature.geometry.type === "LineString" ) {

			const { coordinates } = geoJSONFeature.geometry

			const vertices = []

			for ( const [ lon, lat ] of coordinates ) {

				const [ x, z ] = mercator( [ lon, lat ] )

				vertices.push( x, 0, z )
			}

			const geometry = new THREE.BufferGeometry()
			geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )

			const material = new THREE.LineBasicMaterial( {} )
			const object = new THREE.Line( geometry, material )

			scene.add( object )
		}
		else if ( geoJSONFeature.geometry.type === "Point" ) {

			const { coordinates: [ lon, lat ] } = geoJSONFeature.geometry

			const [ x, z ] = mercator( [ lon, lat ] )

			const geometry = new THREE.BufferGeometry()
			geometry.setAttribute( "position", new THREE.Float32BufferAttribute( [ x, 0, z ], 3 ) )
			const material = new THREE.PointsMaterial( { sizeAttenuation: false, size: 10 } )
			const object = new THREE.Points( geometry, material )
			scene.add( object )
		}
	}
}
