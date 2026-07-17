import React, { useRef, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileEditFormProps {
    initialValues: { name: string; bio: string; avatar: string; skills: string[]; }
    onSave: (values: { name: string; bio: string; avatar: string; skills: string[] }) => void;
    isSaving?: boolean;
}

// interface even { React.ChangeEvent<HTMLInputElement>; }


export function ProfileEditForm({ initialValues, onSave, isSaving }: ProfileEditFormProps) {

    const [name, setName] = useState(initialValues.name);
    const [bio, setBio] = useState(initialValues.bio);
    const [avatar, setAvatar] = useState(initialValues.avatar);
    const [skills, setSkills] = useState<string[]>(initialValues.skills);
    const [singleSkill, setSingleSkill] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);


    function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();

        onSave({ name, bio, avatar, skills })
    }

    function handleAddSkill() {
        if (!singleSkill.trim()) return;
        if (skills.includes(singleSkill.trim())) return;

        setSkills([...skills, singleSkill.trim()]);
        setSingleSkill("");
    }


    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const localImageUrl = URL.createObjectURL(file);
            setAvatar(localImageUrl);
        }
    }


    return (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-">
                <Avatar className="w-16 h-16"><AvatarImage src={avatar}/></Avatar>
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                />
                <Button  onClick={() => fileInputRef.current?.click()} type="button" variant="outline" size="sm" >Change photo</Button>
            </div>

            <div className="flex flex-col gap-1">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}/>
            </div>

            <div className="flex flex-col gap-1">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <span key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">{skill}</span>
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    <Input 
                        placeholder="Add a skill (e.g. React, Video Editing)"
                        value={singleSkill} 
                        onChange={(e) => setSingleSkill(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill()
                            }
                        }}
                    />
                    <Button onClick={handleAddSkill} disabled={!singleSkill.trim()}>
                        Add
                    </Button>
                </div>
            </div>

            <Button type="submit" disabled={isSaving} className="mt-4">
                {isSaving ? "Saving.." : "Save Changes"}
            </Button>
        </form>
    )
}