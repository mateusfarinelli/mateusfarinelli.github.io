// This function recive a tag and class name of element to whill created
// and returns a new element with this params
function newElement(tagName, className) {
  const element = document.createElement(tagName)
  element.className = className
  return element
}

// This function will create a new barrier
// it's very important to remember that we have a two different barriers
// where the upper barrier starts with a trunk and ends with edge, 
// and a bottom barrier starts with edge and ends with trunk
// taking top orientation
function Barrier (reverse = false) {
  this.element = newElement ('div', 'barrier') //Look the first function in action

  const edge = newElement('div', 'edge')
  const trunk = newElement('div', 'trunk')

  this.element.appendChild(reverse ? trunk : edge) // using ternary operator, if reverse = false make a trunk, else make a edge
  this.element.appendChild(reverse ? edge : trunk)

  this.setHeight = height => trunk.style.height = `${height}px`
}

// // Testing w Barrier function
// const b = new Barrier(true) // This barrier initiate on the top
// b.setHeight(50);
// document.querySelector('[wm-flappy]').appendChild(b.element)


// This function will create a pair of barriers
function pairOfBarrier(height, passageSize, xPosition) {
  
  // Create a new div in the DOM
  this.element = newElement('div', 'pair-of-barriers');

  // Create a pair of barriers in the div 'pair-of-barriers'
  this.upper = new Barrier(true)
  this.lower = new Barrier(false)

  // Insert any barrier in your position
  this.element.appendChild(this.upper.element)
  this.element.appendChild(this.lower.element)

  // Drawing the passage position
  this.drawPassagePosition = () => {
    const upperHeight = Math.random() * (height - passageSize)
    const lowerHeight = height - passageSize - upperHeight
    this.upper.setHeight(upperHeight)
    this.lower.setHeight(lowerHeight)
  }

  this.getXPosition = () => parseInt(this.element.style.left.split('px')[0]);
  this.setXPosition = xPosition => this.element.style.left = `${xPosition}px`
  this.getWidth = () => this.element.clientWidth

  this.drawPassagePosition()
  this.setXPosition(xPosition)

}

// // Testing a drawPassagePosition function
// const b = new pairOfBarrier(700, 200, 490)
// document.querySelector('[wm-flappy]').appendChild(b.element)

 // Now we start to animate the game, beginning with the barriers
 // A below function will create four pairs of barriers containing a fixed interval btween
 function Barriers(heightGame, passageSize, widthGame, interval, notifyScore) {
   this.pairs = [
     new pairOfBarrier(heightGame, passageSize, widthGame),
     new pairOfBarrier(heightGame, passageSize, widthGame + interval),
     new pairOfBarrier(heightGame, passageSize, widthGame + interval * 2),
     new pairOfBarrier(heightGame, passageSize, widthGame + interval * 3) 
   ]


   // To not use many resources and turn down the performace of the game, we will let's
   // replay the pairs of barreirs created, by reacalculating the pasagePosition only
   // for this, when teh pair of barriers cross de end of div in left, we put the pair of barriers
   // at the final position after the last pair of barriers in game. 
   const xDisplacement = 3
   this.animate = () => {
     this.pairs.forEach(pair => {
      pair.setXPosition(pair.getXPosition() - xDisplacement)

      if(pair.getXPosition() < -pair.getWidth()) {
        pair.setXPosition(pair.getXPosition() + interval * this.pairs.length)
        pair.drawPassagePosition()
      }

      const mid = widthGame / 2
      const crossMid = pair.getXPosition() + xDisplacement >= mid && pair.getXPosition() < mid
      if (crossMid) {
        notifyScore()
      }
     })
   }
 }

function Bird (heightGame) {
  let flying = false

  this.element = newElement('img', 'bird')
  this.element.src = 'bird.png'

  this.getYPosition = () => parseInt(this.element.style.bottom.split('px')[0])
  this.setYPosition = y => this.element.style.bottom = `${y}px`

  window.onkeydown = e => flying = true
  window.onkeyup = e => flying = false

  this.animateBird = () => {
    const newYPosition = this.getYPosition() + (flying ? 8 : -5)
    const birdHeightMax = heightGame - this.element.clientHeight

    if (newYPosition <= 0) {
      this.setYPosition(0)
    }
    else if (newYPosition >= birdHeightMax) {
      this.setYPosition(birdHeightMax)
    }
    else {
      this.setYPosition(newYPosition)
    }
  }

  this.setYPosition(heightGame / 2)
}

function Score() {
  this.element = newElement('span', 'score');
  this.attScore = score => {
     this.element.innerHTML = score
    }
    this.attScore(0)
  }

// // Testing the animate of barriers
// const bird = new Bird(700)
// const gameArea = document.querySelector('[wm-flappy]')
// const barriers = new Barriers(700, 200, 1200, 400)

// gameArea.appendChild(bird.element)
// gameArea.appendChild(new Score().element)
// barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))
// setInterval(() => {
//   barriers.animate()
//   bird.animateBird()
//     }, 20)


function checkOverlapping (aElement, bElement) {
  const a = aElement.getBoundingClientRect()
  const b = bElement.getBoundingClientRect()

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

  return horizontal && vertical
}
function checkCollision(bird, barriers) {
  let collision = false

  barriers.pairs.forEach(pairOfBarrier => {
    if (!collision) {
      const upper = pairOfBarrier.upper.element
      const lower = pairOfBarrier.lower.element
      collision = checkOverlapping(bird.element, upper) || checkOverlapping(bird.element, lower)
    }
  })
  return collision
}

function FlappyBird() {
  let score = 0

  const gameArea = document.querySelector('[wm-flappy]')
  const gameHeight = gameArea.clientHeight
  const gameWidth = gameArea.clientWidth

  const scoreScreen = new Score()
  const barriers = new Barriers(gameHeight, 200,  gameWidth, 400, () => scoreScreen.attScore(++score))
  const bird = new Bird(gameHeight)

  gameArea.appendChild(scoreScreen.element)
  gameArea.appendChild(bird.element)
  barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

  this.start = () => {
    const timer = setInterval(() => {
      barriers.animate()
      bird.animateBird()

      if (checkCollision(bird, barriers)) {
        clearInterval(timer)
      }
    }, 20)
  }
}

new FlappyBird().start()