import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { getCategoryPricing } from '@/config/pricing';

interface ProfessionalServiceCardsProps {
  category: string;
  onSelectService: (service: {title: string; price: string; duration: string; category: string}) => void;
}

const ProfessionalServiceCards = ({ category, onSelectService }: ProfessionalServiceCardsProps) => {
  // Get pricing from config
  const categoryPricing = getCategoryPricing(category);
  const basePrice = categoryPricing?.basePrice || 500;
  const estimatedDuration = categoryPricing?.estimatedDuration || 2;
  
  // Generic service templates that use base price
  const genericServices = [
    { title: 'Standard Service', description: 'Professional service delivery', duration: `${estimatedDuration} hours`, price: `₹${basePrice}` },
    { title: 'Premium Service', description: 'Enhanced service with extra attention', duration: `${estimatedDuration + 1} hours`, price: `₹${Math.round(basePrice * 1.25)}` },
    { title: 'Express Service', description: 'Quick turnaround service', duration: `${Math.max(1, estimatedDuration - 1)} hours`, price: `₹${Math.round(basePrice * 1.5)}` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {genericServices.map((service, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{service.title}</CardTitle>
            <CardDescription className="text-xs">{service.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{service.duration}</span>
              </div>
              <div className="text-lg font-bold text-primary">{service.price}</div>
            </div>
            <Button 
              size="sm"
              className="w-full"
              onClick={() => onSelectService({...service, category})}
            >
              Select
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfessionalServiceCards;
