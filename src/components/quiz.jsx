import React, { useState } from 'react'
import Results from './results';

const Quiz = () => {
const questionBank = [
  {
    question: "Javascript is a _______ language.",
    option: [
      "Object-Oriented",
      "Procedural",
      "Functional",
      "None of the above"
    ],
    answer: "Object-Oriented"
  },
  {
    question: "DOM stands for _________.",
    option: [
      "Document Object Model",
      "Data Object Model",
      "Digital Object Management",
      "Document Orientation Method"
    ],
    answer: "Document Object Model"
  },
  {
    question: "Tailwind CSS is a CSS framework.",
    option: [
      "true",
      "false",
      "cannot say",
      "None of the above"
    ],
    answer: "true"
  },
  {
    question: "ReactJS is a _______ framework.",
    option: [
      "Frontend",
      "Backend",
      "Fullstack",
      "None of the above"
    ],
    answer: "Frontend"
  },
  {
    question: "What is the largest HTML element?",
    option: [
      "head",
      "body",
      "html",
      "div"
    ],
    answer: "html" 
  }
];
const initialanswers = new Array(questionBank.length).fill(null);
const[useranswers,setuseranswers]=useState(initialanswers);
const[currentquestion,setcurrentquestion]=useState(0);
function handleselectoption(option){
  const newuseranswers=[...useranswers];
  newuseranswers[currentquestion]=option;
  setuseranswers(newuseranswers);
}

function gotonext(){
  if (currentquestion==questionBank.length-1){
    setisquizfinished(true);
  }
  else{
setcurrentquestion(currentquestion+1);}
}
function gotoprev(){
  if (currentquestion>0){
    setcurrentquestion(currentquestion-1);
  }
  
}
function restartquiz(){
    setuseranswers(initialanswers)
    setcurrentquestion(0);
    setisquizfinished(false);
}


const selectedanswer=useranswers[currentquestion];
const [isquizfinished,setisquizfinished]=useState(false);





if (isquizfinished){
  return<Results useranswers={useranswers} questionBank={questionBank} restartquiz={restartquiz}/>
}
  return (
    <div className='flex justify-center' >
      <div id="card" className="h-auto w-auto flex-col justify-center  px-4 py-4 m-5 bg-ghosty-100 rounded-2xl ">
        <div id="title" className='flex-col items-center px-10 py-4'>
        <span className='text-xl bold text-quizzy text-redy-100  p-3  '>QUIZ GAME</span>
        <div id="line" className='w-auto  h-0.5 bg-ashyy-100 overflow-hidden '></div>
        </div>
        <div id="questions">
          <div id="question" className='p-2 text-xl'>
            {questionBank[currentquestion].question}
          </div>
    <div id="optionns">
      {questionBank[currentquestion].option.map((options)=>(
        <button className={"h-auto w-full  rounded-xl m-2 text-left  p-4 "+(selectedanswer===options? "border bg-gray-400 border-blue-500":"bg-gray-300")} onClick={()=>handleselectoption(options)}>{options}</button>
      ))}
      
    </div>
    <div id="nav" className=' w-auto h-auto  flex justify-between items-center m-3 px-5  '>
      <button className='h-auto w-auto bg-ashyy-100 px-4 py-2 rounded-3xl hover:bg-amber-50'onClick={gotoprev} disabled={currentquestion===0} >Previous</button>
      <button className='h-auto w-auto bg-ashyy-100 px-4 py-2 rounded-3xl hover:bg-amber-50' onClick={gotonext} disabled={!selectedanswer} >{currentquestion===questionBank.length-1 ? "Submit":"Go Next"}</button>
    </div>
        </div>
      </div>
    </div>

    
  )
}

export default Quiz
