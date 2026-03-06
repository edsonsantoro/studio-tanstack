import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HotmartProduct } from '@/lib/hotmart';

export function CourseCard({ course }: { course: HotmartProduct }) {
    const formatLabels: Record<string, string> = {
        'EBOOK': 'E-book',
        'VIDEOS': 'Vídeo-Série',
        'ONLINE_COURSE': 'Curso Online',
        'AUDIO': 'Áudio/Podcast',
        'BUNDLE': 'Combo/Pacote',
        'COMMUNITY': 'Comunidade'
    };

    const periodicityLabels: Record<string, string> = {
        'WEEKLY': 'semanal',
        'MONTHLY': 'mensal',
        'BIMONTHLY': 'bimestral',
        'QUARTERLY': 'trimestral',
        'SEMIANNUAL': 'semestral',
        'ANNUAL': 'anual'
    };

    const displayFormat = course.format ? (formatLabels[course.format] || course.format) : 'Série Especial';
    const isSubscription = !!course.periodicity;
    const periodicityText = course.periodicity ? (periodicityLabels[course.periodicity] || course.periodicity) : '';

    return (
        <Card className="flex flex-col overflow-hidden transform hover:scale-105 transition-transform duration-300 h-full">
            <CardHeader className="p-0">
                <div className="aspect-video relative overflow-hidden">
                    <div className="absolute top-2 right-2 z-10">
                        <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded uppercase">
                            {isSubscription ? `Assinatura ${periodicityText}` : displayFormat}
                        </span>
                    </div>
                    <img
                        src={course.imageUrl || `https://picsum.photos/seed/${course.id}/400/225`}
                        alt={course.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
                <CardTitle className="font-headline mb-2 text-xl line-clamp-2">{course.name}</CardTitle>
                <CardDescription className="line-clamp-4">{course.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex-col items-stretch gap-4">
                <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {isSubscription ? 'Cobrança Recorrente' :
                            course.format === 'ONLINE_COURSE' ? 'Acesso Vitalício' : 'Entrega Imediata'}
                    </span>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold">{course.price}</p>
                        {isSubscription && periodicityText && (
                            <span className="text-sm text-muted-foreground">/ {periodicityText}</span>
                        )}
                    </div>
                </div>
                <Button asChild className="w-full">
                    <a href={course.url} target="_blank" rel="noopener noreferrer">Comprar na Hotmart</a>
                </Button>
            </CardFooter>
        </Card>
    );
}
