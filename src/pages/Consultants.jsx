import { Phone, Mail, Linkedin } from 'lucide-react';
import { CONSULTANTS } from '../constants/consultants';

const Consultants = () => {
    return (
        <div className="pt-24 pb-20 min-h-screen bg-primary">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Uzman Ekibimiz</h1>
                    <p className="text-slate-300 text-xl max-w-2xl mx-auto">
                        Size en iyi hizmeti sunmak için buradayız. Gayrimenkul yatırımlarınızda güvenilir iş ortağınız.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CONSULTANTS.map((consultant) => (
                        <div key={consultant.id} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow border border-slate-100">
                            <div className="aspect-[3/4] overflow-hidden">
                                <img
                                    src={consultant.image}
                                    alt={consultant.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-primary mb-1">{consultant.name}</h3>
                                <p className="text-secondary font-medium mb-4">{consultant.role}</p>

                                <div className="space-y-3 text-slate-600">
                                    <a href={`tel:${consultant.phone}`} className="flex items-center gap-3 hover:text-black transition-colors">
                                        <Phone size={18} className="text-secondary" />
                                        <span className="text-sm">{consultant.phone}</span>
                                    </a>
                                    <a href={`mailto:${consultant.email}`} className="flex items-center gap-3 hover:text-black transition-colors">
                                        <Mail size={18} className="text-secondary" />
                                        <span className="text-sm">{consultant.email}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Consultants;
