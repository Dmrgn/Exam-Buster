import { Paperclip, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useEffect, useRef, useState, type FormEventHandler } from "react";

export default function ChatInput({ sendMessage, loading, quotedText, setQuotedText }:
    { sendMessage: (input: string, files: FileList | undefined) => Promise<void>, loading: boolean, quotedText: string, setQuotedText: React.Dispatch<React.SetStateAction<string>> }) {
    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const [input, setInput] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(event.target.files);
        }
    }

    const removeFiles = () => {
        setFiles(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setInput('');
        await sendMessage(input, files);
        inputRef.current.focus();
    }

    useEffect(()=>{
        if (quotedText.trim() !== "") {
            setInput(input + quotedText);
            setQuotedText("");
        }
    }, [quotedText])

    return <>
        {/* file preview */}
        {files && files.length > 0 && (
            <div className="px-4 py-2 border-t bg-muted/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">
                            {files.length} file{files.length > 1 ? "s" : ""} selected
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeFiles}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        )}
        {/* actual input box */}
        <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                <div className="flex-1">
                    <Textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        disabled={loading}
                        className="resize-none min-h-[40px] max-h-[120px] overflow-y-auto max-w-full"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (input.trim() || files) {
                                    const form = e.currentTarget.form;
                                    if (form) {
                                        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
                                        form.dispatchEvent(submitEvent);
                                    }
                                }
                            }
                        }}
                        style={{
                            height: "auto",
                            minHeight: "40px",
                            maxHeight: "120px",
                        }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = Math.min(target.scrollHeight, 120) + "px";
                        }} />
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".png,.jpeg,.jpg,.webp,.pdf"
                    multiple
                    className="hidden" />

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                >
                    <Paperclip className="w-4 h-4" />
                </Button>

                <Button type="submit" size="icon" disabled={loading || (!input.trim() && !files)}>
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    </>
}