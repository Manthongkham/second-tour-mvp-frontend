import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = () => { 
    const el = textareaRef.current
    if (!el) return

    if (el.value.length === 0) {
      el.style.height = 'auto'
      return
    }

    const MAX_LINES = 7
    const LINE_HEIGHT = 20 // must match your CSS line-height: 20px

    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, MAX_LINES * LINE_HEIGHT) + 'px'
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>


      <div className="chat-input-container">
        <div className="chat-input-wrap">
          <textarea
          ref={textareaRef}     
          onInput={autoResize}
          placeholder="User Input Goes Here..."
          className="chat-input"
          rows={1}
          maxLength={1500}
          />

          <button className="chat-send-btn" type="button" aria-label="Send">
            ↑
          </button>

        </div>
        
      </div>


    </>
  )
}

export default App
