'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteUser } from '@/actions/users';
import { useToast } from '@/hooks/use-toast';
import { Link, useRouter, useSearch, useNavigate, useLocation } from '@tanstack/react-router';
import { useDebouncedCallback } from 'use-debounce';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function UsersTable({ users }: { users: any[] }) {
    const [userToDelete, setUserToDelete] = React.useState<any>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const matches = router.state.matches;
    const localeMatch = matches.find((m) => m.params && (m.params as any).locale);
    const locale = (localeMatch?.params as any)?.locale || 'pt';

    const handleDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteUser({ data: userToDelete.id });
            if (result.success) {
                toast({ title: "Usuário removido" });
                setUserToDelete(null);
                router.invalidate();
            } else {
                throw new Error("Falha ao remover usuário");
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o usuário." });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Table>
                <TableHeader className="hidden md:table-header-group">
                    <TableRow>
                        <TableHead className="w-[100px]">
                            <span className="sr-only">Avatar</span>
                        </TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>
                            <span className="sr-only">Ações</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users && users.length > 0 ? (
                        users.map((user) => (
                            <TableRow key={user.id} className="flex flex-col md:table-row border-b md:border-b-0 items-start md:items-center relative">
                                <TableCell className="block md:table-cell w-full md:w-auto">
                                    <div className="flex items-center gap-3">
                                        <img
                                            alt="Avatar do usuário"
                                            className="h-10 w-10 aspect-square rounded-full object-cover"
                                            src={user.profilePictureUrl || `https://avatar.vercel.sh/${user.id}.png`}
                                        />
                                        <div className="md:hidden flex flex-col">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell font-medium">
                                    {user.name}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                <TableCell className="block md:table-cell w-full md:w-auto mt-2 md:mt-0">
                                    <span className="md:hidden font-semibold mr-2 text-muted-foreground">Local:</span>
                                    {user.city}, {user.country}
                                </TableCell>
                                <TableCell className="text-right block md:table-cell w-full md:w-auto absolute top-2 right-2 md:static">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link to="/$locale/admin/users/$id/edit" params={{ locale, id: user.id }} search={{ q: undefined } as any}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Editar</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setUserToDelete(user)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Excluir</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center p-8">
                                Nenhum usuário encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o perfil de
                            <span className="font-bold"> {userToDelete?.name}</span> do banco de dados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className={buttonVariants({ variant: "destructive" })} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function UserSearch() {
    const search = useSearch({ from: '/$locale/admin/users' }) as any;
    const navigate = useNavigate();

    const handleSearch = useDebouncedCallback((term: string) => {
        navigate({
            search: (prev: any) => ({ ...prev, q: term || undefined }),
            replace: true
        } as any);
    }, 300);

    return (
        <div className="mb-4">
            <Input
                placeholder="Buscar por nome, email, cidade..."
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={search.q}
                className="max-w-sm"
            />
        </div>
    );
}
