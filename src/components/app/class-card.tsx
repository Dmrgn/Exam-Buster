import { AppSidebar, type Class } from "@/components/app/app-sidebar";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { Clipboard, PaintBucket, Trash2, Upload } from 'lucide-react';
import UploadTextbook from "./upload-textbook";
import { Button } from "../ui/button";

interface Chat {
    id: string;
    userId: string;
    messages: any[]; // Use a more specific type if available
    name: string;
    created: string;
    updated: string;
}

export default function ClassCard({ currentClass, refreshClasses, onDelete, onUpdate }: { 
    currentClass: Class;
    refreshClasses: () => Promise<void>;
    onDelete: () => Promise<void>;
    onUpdate: (updatedData: Partial<Class>) => Promise<void>;
}) {

    const [isEditingName, setIsEditingName] = useState(false);
    const [newClassName, setNewClassName] = useState("");
    const [showUpload, setShowUpload] = useState(false);

    const handleNameClick = () => {
        setIsEditingName(true);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewClassName(e.target.value);
    };

    const handleNameBlur = async () => {
        setIsEditingName(false);
        if (currentClass && newClassName !== currentClass.name && newClassName.trim() !== "") {
            try {
                await onUpdate({name: newClassName});
            } catch (err) {
                console.error("Error updating chat name:", err);
                setNewClassName(currentClass.name);
            }
        }
    };

    const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const colorInputRef = useRef<HTMLInputElement>(null);
    const colorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    return (
        < Card className="bg-card/50 backdrop-blur-sm border-muted w-full" >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-4 pb-4 border-b" >
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Avatar 
                            className='p-1 rounded-md flex' 
                            style={{ backgroundColor: currentClass.color }}
                            onClick={() => colorInputRef.current?.click()}
                        >
                            <AvatarFallback>
                                <PaintBucket></PaintBucket>
                            </AvatarFallback>
                        </Avatar>
                        <input
                            type="color"
                            ref={colorInputRef}
                            value={currentClass.color}
                            onChange={(e) => {
                                const newColor = e.target.value;
                                if (colorTimeoutRef.current) {
                                    clearTimeout(colorTimeoutRef.current);
                                }
                                colorTimeoutRef.current = setTimeout(() => {
                                    onUpdate({ color: newColor });
                                }, 500);
                            }}
                            style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
                        />
                    </div>
                    <div>
                        {isEditingName ? (
                        <Input
                            value={newClassName}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            onKeyPress={handleNameKeyPress}
                            autoFocus
                            className="h-6 text-base"
                        />
                        ) : (
                        <h3 onClick={handleNameClick} className="cursor-pointer font-semibold">
                            {currentClass ? currentClass.name : "Loading..."}
                        </h3>
                                    )}
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete this class?')) {
                            onDelete();
                        }
                    }}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </CardHeader >
            <CardContent>
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold">Textbook</h4>
                        <p className="text-sm text-muted-foreground">
                            Status: <span className="font-medium">{currentClass.textbook_status || 'Not Uploaded'}</span>
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowUpload(!showUpload)}>
                        <Upload className="h-4 w-4 mr-2" />
                        {showUpload ? 'Cancel' : 'Upload Textbook'}
                    </Button>
                </div>
                {showUpload && (
                    <div className="mt-2">
                        <UploadTextbook
                            classId={currentClass.id}
                            onComplete={() => {
                                setShowUpload(false);
                                refreshClasses();
                            }}
                        />
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
