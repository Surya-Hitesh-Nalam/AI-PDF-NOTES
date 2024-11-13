import { chatSession } from '@/configs/AIModel';
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs';
import { useAction, useMutation } from 'convex/react'
import { Bold, Italic, Sparkle } from 'lucide-react'
import { useParams } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';

function EditorExtensions({editor,fileId}) {
    const { fileId } = useParams();
    const SearchAI = useAction(api.myAction.search)
    const saveNotes=useMutation(api.notes.AddNotes)
    const {user}=useUser()

    const onAIClick=async()=>{
      toast('Ai is working on your answer')
        // console.log('ai button clicked')
        const selectedText=editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
        )
        console.log(selectedText)

        const result= await SearchAI({
            query:selectedText,
            fileId:fileId,
        })

        const UnformatedAns=JSON.parse(result);
        let AllUnformatedAns=''
        UnformatedAns&& UnformatedAns.forEach(item=>{
          AllUnformatedAns+=item.pageContent
        });

        const PROMPT="FOr question :"+selectedText+" and with given content as answer,"+
        "please give appropriate answer in HTML format . The answer content is: "+AllUnformatedAns;

        const AIModelResult=await chatSession.sendMessage(PROMPT)
        console.log(AIModelResult.response.text())
        FinalAns=AIModelResult.response.text().replace('```','').replace('html','').replace('```','');

        const AllText = editor.getHTML();
        editor.commands.setContent(AllText+'<p> <strong>Answer: </strong>'+FinalAns+'</p>')
        saveNotes({
          notes:editor.getHTML(),
          fileId:fileId,
          createdBy:user.primaryEmailAddress?.emailAddress
        })
    }
  return editor&&(
    <div className='p-5 '>
      <div className="control-group">
        <div className="button-group flex gap-3">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'text-blue-500' : ''}
          >
            <Bold/>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'text-blue-500' : ''}
          >
            <Italic/>
          </button>
          <button
            onClick={() => onAIClick()}
            className={'hover:text-blue-500'}
          >
            <Sparkles/>
          </button>
          </div>
          </div>
    </div>
  )
}

export default EditorExtensions
