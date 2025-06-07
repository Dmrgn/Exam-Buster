import ChatMessenger from '@/components/chat-messenger';

export default function ChatScreen() {
    if (!localStorage.getItem("pocketbase_auth")) window.location.replace("/login");

    return (
        <ChatMessenger />
        // <div className="flex justify-center w-full">
        //     <div className="flex flex-col h-full max-h-screen p-4">
        //         {chats?.map(x => <>
        //             <Button onClick={()=>setChatId(x.id)}>{x.id}</Button>
        //         </>)}
        //     </div>
        //     <div className="flex flex-col h-full max-h-screen p-4">
        //         <h1 className="text-2xl font-bold mb-4">AI Chat</h1>
        //         <div className="flex-1 overflow-y-auto border p-4 rounded flex flex-col">
        //             {messages?.map((m, idx) => (
        //                 <div
        //                     key={idx}
        //                     className={`max-w-md mb-2 p-2 rounded ${m.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
        //                         }`}
        //                 >
        //                     <p className='text-black'>{m.content}</p>
        //                 </div>
        //             ))}
        //             <div ref={endRef} />
        //         </div>
        //         <div className="mt-4 flex items-end gap-2">
        //             <textarea
        //                 className="flex-1 border rounded p-2 resize-none"
        //                 rows={3}
        //                 value={input}
        //                 onChange={(e) => setInput(e.target.value)}
        //                 disabled={loading}
        //             />
        //             <button
        //                 onClick={sendMessage}
        //                 disabled={loading}
        //                 className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        //             >
        //                 Send
        //             </button>
        //         </div>
        //     </div>
        // </div>
    );
}