import { useState , useRef, useEffect} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


import "./styles.css"
import { Stage, Layer, Circle, Rect } from 'react-konva'


function App() {
  const fps=500

  const groundWidth = 500, groundHeight = 800
  const barHandleLength = 140, barHandleHeight = 10
  const barHandleSpeed = 40

  const numberOfTargetsWidthWise = 10
  const numberOfTargetsHeightWise = 5
  const targetDiameter = groundWidth / numberOfTargetsWidthWise
  const targetRadius = targetDiameter/2

  let initialTargets = []

  for(let i=0; i<numberOfTargetsHeightWise; i++){
    for(let j=0; j<numberOfTargetsWidthWise; j++){
      initialTargets.push({
        x: targetRadius + (j*targetDiameter),
        y: targetRadius + (i*targetDiameter),
        fill: "lightblue"
      })
    }
  }

  const [targets, setTargets] = useState(initialTargets)

  const [circles, setCircles] = useState([])
  const [barHandle, setBarHandle] = useState({x: groundWidth/2 - (barHandleLength/2), y: groundHeight-50})

  // const barHandleState = useState({x: groundWidth/2, y: groundHeight-50})
  // const barHandleRef = useRef({})
  // barHandleRef.current = barHandle


  const stageRef = useRef(null)

  const attackBallDirectionXEnum = ["Left", "Right", "Middle"]
  const attackBallDirectionYEnum = ["Up", "Down"]

  const [attackBall, setAttackBall] = useState({
    x: groundWidth/2,
    y: groundHeight-50 - barHandleHeight-15,
    directionX: attackBallDirectionXEnum[Math.floor(Math.random() * attackBallDirectionXEnum.length)],
    directionY: "Up"
  })


  // const attackBallRef = useRef({
  //   x: groundWidth/2,
  //   y: groundHeight-50 - barHandleHeight-15,
  //   directionX: attackBallDirectionXEnum[Math.floor(Math.random() * attackBallDirectionXEnum.length)],
  //   directionY: "Up"
  // })


  function circleIntersect(x0, y0, r0, x1, y1, r1){
    return Math.hypot(x0 - x1, y0 - y1) <= r0 + r1;
  }

  const updateAttackBallDirection = ()=>{
    let offset = barHandle.x

    const attackBallSegregation = {
      start: offset + 0,
      midLeft: offset + Math.round(barHandleLength * 0.4),
      midRight: offset + barHandleLength - Math.round(barHandleLength * 0.4),
      end: offset + barHandleLength
    }

    console.log("here")
    console.log(attackBallSegregation)

    let direction

    if(attackBall.x >= attackBallSegregation.start && attackBall.x < attackBallSegregation.midLeft){
      direction = "Left"
      console.log(1)
    }
    else if(attackBall.x >= attackBallSegregation.midLeft && attackBall.x < attackBallSegregation.midRight){
      direction = "Middle"
      console.log(2)
    }
    else if(attackBall.x >= attackBallSegregation.midRight && attackBall.x <= attackBallSegregation.end){
      direction = "Right"
      console.log(3)
    }
    
    return direction
  }


  const checkCollision = ()=>{
    if(attackBall.directionX == "Left" && attackBall.x-1 == 0){
      setAttackBall({...attackBall, directionX: "Right"})
    }
    else if(attackBall.directionX == "Right" && attackBall.x+1 == groundWidth){
      setAttackBall({...attackBall, directionX: "Left"})
    }

    if(attackBall.directionY == "Down" && attackBall.y+1 == groundHeight-50-barHandleHeight-14 && attackBall.x >= barHandle.x && attackBall.x <= barHandle.x+barHandleLength){
      console.log("hereeeeeeeee")
      let directionX = updateAttackBallDirection()
      setAttackBall({...attackBall, directionY: "Up", directionX})
    }
    else if(attackBall.directionY == "Up" && attackBall.y-1 >= numberOfTargetsHeightWise*targetDiameter){
      let collisionBool = targets.some((target)=>{
        return circleIntersect(target.x, target.y, targetRadius, attackBall.x, attackBall.y, targetRadius)
      })

      if(collisionBool){
        setAttackBall({...attackBall, directionY: "Down"})
      }
    }

    console.log(attackBall.directionY)
  }


  const updateAttackBallPosition = ()=>{
    let calcX
    let calcY

    if(attackBall.directionX == "Left"){
      calcX = attackBall.x - 1
    }
    else if(attackBall.directionX == "Right"){
      calcX = attackBall.x + 1
    }
    else{
      calcX = attackBall.x
    }

    if(attackBall.directionY == "Up"){
      calcY = attackBall.y - 1
    }
    else if(attackBall.directionY == "Down"){
      calcY = attackBall.y + 1
    }


    setAttackBall((prevData)=> ({...prevData, x: calcX, y: calcY}))
  }

  // const [gameIntervalId, setGameIntervalId] = useState(null)

  useEffect(()=>{

    function main(){
      checkCollision()
      updateAttackBallPosition()
    }

    // main()
    let id = setTimeout(main, 1000/fps)

    // setGameIntervalId(id)

    return ()=>{
      window.clearInterval(id)
    }
  }, [attackBall])


  useEffect(()=>{
    const keyDownHandler = event =>{
      // console.log("User pressed: ", event.key)
      event.preventDefault()
      let calcX

      if (event.key === "ArrowRight"){
        if(barHandle.x + barHandleLength + barHandleSpeed >= groundWidth){
          calcX = groundWidth - barHandleLength
        }
        else{
          calcX = barHandle.x + barHandleSpeed
        }
      }
      else if(event.key === "ArrowLeft"){
        if(barHandle.x - barHandleSpeed <=0){
          calcX = 0
        }
        else{
          calcX = barHandle.x - barHandleSpeed
        }
      }

      setBarHandle({...barHandle, x: calcX})
    }

    document.addEventListener("keydown", keyDownHandler)

    return ()=>{
      document.removeEventListener("keydown", keyDownHandler)
    }
  }, [barHandle])


  const mouseMoveHandler = (e) => {
    let pointerPosition = stageRef.current.getPointerPosition()
    let pointerX = pointerPosition.x
    let calcX
    
    if(pointerX + barHandleLength >= groundWidth){
      calcX = groundWidth - barHandleLength
    }
    else{
      calcX = pointerX
    }

    // barHandleRef.current.x = pointerX
    setBarHandle((prevData)=>({...prevData, x: calcX}))
  }

  return (
    <div style={{border: "2px solid black", width:groundWidth, height: groundHeight, margin:"auto", marginTop:15}}>

      <Stage width={groundWidth} height={groundHeight} ref={stageRef} onMouseMove={mouseMoveHandler}>
        <Layer>
          {targets.map((eachCircle, index)=>{
            return <Circle
            key={`circle-${index}`}
            x={eachCircle.x}
            y={eachCircle.y}
            radius={targetRadius}
            fill={eachCircle.fill}
            />
          })}

          <Circle 
            key="attack-ball"
            x={attackBall.x}
            y={attackBall.y}
            radius={targetRadius}
            fill="black"
          />

          <Rect name='barHandle' x={barHandle.x} y={barHandle.y} width={barHandleLength} height={barHandleHeight} fill="red"></Rect>
        </Layer>
      </Stage>

    </div>
  )

  // return (
  //   <>
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.jsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )
}

export default App
