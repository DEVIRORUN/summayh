import { Card } from "../ui/card";
import { AlertDialog, AlertDialogTitle, AlertDialogDescription, AlertDialogContent, AlertDialogCancel, AlertDialogAction, AlertDialogFooter, AlertDialogTrigger, AlertDialogHeader } from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface DangerZoneSectionProps {
    onDeactivate: () => void;
    onDeleteAccount: () => void;
}

export function DangerZoneSection({ onDeactivate, onDeleteAccount }: DangerZoneSectionProps) {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Deactivate account</p>
                    <p className="text-xs font-muted-foreground">Temporarily hide your profile and gigs.</p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">Deactivate</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
                            <AlertDialogDescription>You can reactivate anytime by logging back in.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDeactivate}>Cancel</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Delete account</p>
                    <p className="text-xs font-muted-foreground">This action is permanent and cannot be undone.</p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
                            <AlertDialogDescription>All your gigs, order and data will be lost forever</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDeleteAccount} className="bg-red-600">Delete forever</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    )
}