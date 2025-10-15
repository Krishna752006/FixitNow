import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Clock, DollarSign, Search, Filter } from "lucide-react";
import { api } from "@/services/api";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CreateJobModal from "@/components/CreateJobModal";

interface ProfessionalWithStats {
  _id: string;
  firstName: string;
  lastName: string;
  services: string[];
  city: string;
  hourlyRate: number;
  rating: {
    average: number;
    count: number;
  };
  bio?: string;
  profileImage?: string;
  experience: number;
  stats: {
    completedJobs: number;
    averageRating: number;
    totalEarnings: number;
  };
}

const ProfessionalsListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [professionals, setProfessionals] = useState<ProfessionalWithStats[]>([]);
  const [categories, setCategories] = useState<{ _id: string; count: number; avgRating: number; avgHourlyRate: number }[]>([]);
  const [cities, setCities] = useState<{ _id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProfessionals: 0,
  });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    service: searchParams.get('service') || '',
    minRating: searchParams.get('minRating') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
  });

  useEffect(() => {
    fetchProfessionals();
    fetchCategories();
    fetchCities();
  }, [searchParams]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      };

      const response = await api.getProfessionals(params);
      if (response.success) {
        setProfessionals(response.data.professionals);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getServiceCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await api.getCities();
      if (response.success) {
        setCities(response.data.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      service: '',
      minRating: '',
      maxPrice: '',
      sortBy: 'rating',
    });
    setSearchParams({});
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Find Professional Services
          </h1>
          <p className="text-muted-foreground">
            Discover qualified professionals in your area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search professionals, services, or keywords..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={fetchProfessionals} className="md:w-auto">
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.city} onValueChange={(value) => updateFilters({ city: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city._id} value={city._id}>
                    {city._id} ({city.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.service} onValueChange={(value) => updateFilters({ service: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Services</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category._id} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        {!loading && professionals.length > 0 && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {professionals.length} of {pagination.totalProfessionals} professionals
            </p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No Professionals Found</h3>
              <p className="text-muted-foreground mb-8">
                {filters.search || filters.city || filters.service
                  ? "Try adjusting your filters or search terms to find more professionals."
                  : "Be the first to join our platform as a professional!"}
              </p>
              
              {(filters.search || filters.city || filters.service) && (
                <Button onClick={clearFilters} variant="outline" className="mb-8">
                  Clear All Filters
                </Button>
              )}

              {/* Available Services */}
              <div className="mt-12">
                <h4 className="text-lg font-semibold mb-6">Available Services</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'AC Repair', 'Gardening', 'Appliance Repair'].map((service) => (
                    <Card key={service} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className="font-medium">{service}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
                <div className="p-6 bg-white rounded-lg border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <h5 className="font-semibold mb-2">1. Search</h5>
                  <p className="text-sm text-muted-foreground">
                    Browse professionals by service, location, or rating
                  </p>
                </div>
                <div className="p-6 bg-white rounded-lg border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <h5 className="font-semibold mb-2">2. Compare</h5>
                  <p className="text-sm text-muted-foreground">
                    Check ratings, reviews, and pricing before booking
                  </p>
                </div>
                <div className="p-6 bg-white rounded-lg border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h5 className="font-semibold mb-2">3. Book</h5>
                  <p className="text-sm text-muted-foreground">
                    Schedule service at your convenience with fixed pricing
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="text-xl font-bold mb-2">Are you a Professional?</h4>
                <p className="text-muted-foreground mb-4">
                  Join our platform and connect with customers looking for your services
                </p>
                <Button onClick={() => window.location.href = '/register/professional'}>
                  Register as Professional
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <Card key={professional._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {professional.firstName} {professional.lastName}
                      </CardTitle>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 text-muted-foreground mr-1" />
                        <span className="text-sm text-muted-foreground">
                          {professional.city}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        {renderStars(professional.rating.average)}
                        <span className="ml-1 text-sm text-muted-foreground">
                          ({professional.rating.count})
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          ${professional.hourlyRate}/hr
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {professional.services.slice(0, 3).map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {professional.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.services.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {professional.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {professional.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {professional.experience} years exp.
                      </div>
                      <div>
                        {professional.stats.completedJobs} jobs completed
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/professionals/${professional._id}`, '_blank')}
                      >
                        View Profile
                      </Button>
                      <CreateJobModal
                        trigger={
                          <Button size="sm" className="flex-1">
                            Book Now
                          </Button>
                        }
                        preselectedProfessional={professional._id}
                        preselectedService={professional.services[0]}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <Button
              variant="outline"
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={pagination.currentPage === page ? "default" : "outline"}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProfessionalsListing;
