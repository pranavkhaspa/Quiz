import React from 'react'

const Results = ({questionBank,useranswers,restartquiz}) => {
    function getscore(){
        let finalscore=0;
       useranswers.forEach((answer,index)=>{
        if(answer===questionBank[index].answer){
            finalscore++
        }
       });
        
        return finalscore;
    }
    const score=getscore()





    return (
    
    <div className='flex-col items-center justify-center'>
      <h2 className='text-redy-100 text-center text-3xl font-bold m-3 p-2'>Quiz completed!</h2>
      <p className='text-center text-2xl m-3 p-2 text-redy-100'>Your score is: {score}/{questionBank.length} <br /><button onClick={restartquiz} className='h-auto w-auto bg-ashyy-100 hover:bg-ghosty-100 text-center text-2xl p-3 m-4 rounded-2xl'>Restart</button></p>
      
    </div>
  )
}

export default Results
