import { useEffect, useState } from 'react';
import { DeliveryNavbar } from '../../components/delivery/landing/DeliveryNavbar';
import { getAcceptedOrders } from '../../services/delivery.service';
import { MapPin, Package, Clock, Truck } from 'lucide-react';
import { PositionProvider, usePosition } from '../../providers/PositionProvider';
import OrderMap from '../../components/shared/OrderMap';


function ActiveDeliveryView({ order }: { order: any }) {
    const { myPosition } = usePosition();

    return (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-orange-50 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">En entrega activa</p>
                    <h2 className="text-2xl font-black text-gray-800 uppercase italic">Orden #{order.id.split('-')[0]}</h2>
                </div>
                <div className="bg-orange-500 text-white p-3 rounded-2xl">
                    <Truck size={24} />
                </div>
            </div>

            <OrderMap
                deliveryPos={myPosition}
                destination={{
                    latitude: order.destination_lat,
                    longitude: order.destination_lng
                }}
                isInteractive={true}
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Destino del Cliente</span>
                    <p className="text-sm font-black text-gray-700 flex items-center gap-2 mt-1">
                        <MapPin size={16} className="text-red-500" /> {order.customer_name}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Artículos</span>
                    <div className="mt-1">
                        {order.items?.map((item: any, i: number) => (
                            <p key={i} className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                                <Package size={12} /> {item.quantity}x {item.product_name}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-orange-600 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-200">
                <Clock className="text-white animate-pulse" size={20} />
                <p className="text-white font-black italic text-xs uppercase text-center">
                    ¡Conduce! La orden se entregará al estar a menos de 5 metros
                </p>
            </div>
        </div>
    );
}

export default function AcceptedOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const deliveryid = localStorage.getItem('userid');

    const loadAccepted = async () => {
        if (!deliveryid) return;
        try {
            const data = await getAcceptedOrders(deliveryid);
            setOrders(data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        loadAccepted();
        const interval = setInterval(loadAccepted, 5000);
        return () => clearInterval(interval);
    }, []);

    const activeOrder = orders.length > 0 ? orders[0] : null;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <DeliveryNavbar />
            <main className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-black uppercase italic mb-8 text-orange-600">Panel de Navegación</h1>

                {activeOrder ? (
                    <PositionProvider activeOrder={activeOrder}>
                        <ActiveDeliveryView order={activeOrder} />
                    </PositionProvider>
                ) : (
                    <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-200">
                        <p className="font-black text-gray-400 uppercase italic">No tienes entregas pendientes en el radar.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
