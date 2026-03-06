'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function TranslationsClient({ initialTranslations, locales, baseLocale }) {
  return (
    <div className='p-8'>
      <h2 className='text-2xl font-bold mb-4'>Editor de Traduções (Fase: Tabela)</h2>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chave</TableHead>
              {locales.map(l => <TableHead key={l}>{l.toUpperCase()}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={locales.length + 1} className='text-center py-4'>
                Tabela integrada. Próximo passo: carregar chaves reais.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
