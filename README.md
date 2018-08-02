# aframe-physics-spring
Cannon.js spring class encapsulated in a AFRAME.component

## Requirements
[aframe physics system](https://github.com/donmccurdy/aframe-physics-system) <br>
[aframe](https://aframe.io/)

## Usage
```
<a-box id="one" static-body></a-box>
<a-box spring="target: #one"></box>
```
## Attributes
```
spring="target: t; restLength: 1; damping: 100; stiffness: 1"
```
**target** - the other end of the spring <br>
**restLength** - spring length when no forces applied <br>
**damping** - how much can it stretch <br>
**stiffness** - how much will it suppress the force <br>

## Example
[glitch example](https://aframe-physics-spring.glitch.me/)