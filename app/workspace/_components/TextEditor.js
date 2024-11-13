import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'
import EditorExtensions from './EditorExtensions'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

function TextEditor({fileId}) {
    const notes = useQuery(api.notes.GetNotes,{
      fileId:fileId
    })
    console.log(notes)

    const editor = useEditor({
        extensions: [StarterKit,
          Placeholder.configure({
            placeholder:'Start Taking your notes here...'
          })
        ],
        immediatelyRender:false,
        editorProps:{
          attributes:{
            class:'focus:outline-none h-screen p-5'
          }
        }
      })
      //to get stored notes in the db
      useEffect(()=>{
        editor&&editor.commands.setContent(notes)
      },[notes&&editor])
  return (
    <div>
      <EditorExtensions editor={editor} />
      <div className='overflow-scroll h-[88vh]'>
       <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default TextEditor
