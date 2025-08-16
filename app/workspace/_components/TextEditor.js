import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'
import EditorExtensions from './EditorExtensions'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

function TextEditor({fileId}) {
    // Get notes for this file
    const notes = useQuery(api.notes.GetNotes, {
      fileId: fileId
    });
    
    const editor = useEditor({
        extensions: [StarterKit,
          Placeholder.configure({
            placeholder: 'Start Taking your notes here...'
          })
        ],
        immediatelyRender: false,
        editorProps: {
          attributes: {
            class: 'focus:outline-none h-screen p-5'
          }
        }
    });

    // Load stored notes when available
    useEffect(() => {
        if (editor && notes !== undefined) {
            if (notes && notes.length > 0) {
                editor.commands.setContent(notes);
            } else {
                // Set empty content if no notes exist
                editor.commands.setContent('');
            }
        }
    }, [notes, editor]);

    // Show loading state while notes are being fetched
    if (!fileId) {
        return <div className="p-5">No file ID provided</div>;
    }

    return (
        <div>
            <EditorExtensions editor={editor} fileId={fileId} />
            <div className='overflow-scroll h-[88vh]'>
                {notes === undefined ? (
                    <div className="p-5 text-gray-500">Loading notes...</div>
                ) : (
                    <EditorContent editor={editor} />
                )}
            </div>
        </div>
    );
}

export default TextEditor;