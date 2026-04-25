import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/consumer/landing/ConsumerNavbar';
import { getUserOrders } from '../../services/order.service';
import { MapPin, Package, X } from 'lucide-react'; // Añadí X para el botón de cerrar
import { useOrderTracking } from '../../providers/OrderTrackingProvider';
import OrderMap from '../../components/shared/OrderMap';
import { OrderStatus } from '../../types/orders.types';

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [trackingOrder, setTrackingOrder] = useState<any>(null);

    const navigate = useNavigate();
    const userid = localStorage.getItem('userid');

    const { deliveryPos, currentStatus, isTracking, startTracking, stopTracking } = useOrderTracking();

    useEffect(() => {
        if (!userid) { navigate('/login'); return; }
        const fetchOrders = async () => {
            try {
                const data = await getUserOrders(userid);
                setOrders(data);
            } catch (error) {
                console.error("Error al obtener pedidos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
    }, [userid, navigate]);

    useEffect(() => {
    const active = orders.find(
        (o) => o.status === OrderStatus.IN_DELIVERY
    );

    if (!active) {
        setTrackingOrder(null);
        stopTracking();
    }

}, [orders, stopTracking]);

    useEffect(() => {
        if (
            currentStatus === OrderStatus.DELIVERED &&
            trackingOrder
        ) {
            setOrders(prev =>
                prev.map(order =>
                    order.id === trackingOrder.id
                        ? { ...order, status: OrderStatus.DELIVERED }
                        : order
                )
            );

            setTimeout(() => {
                stopTracking();
                setTrackingOrder(null);
            }, 3000);
        }
    }, [currentStatus, trackingOrder, stopTracking]);

    const handleTrack = (order: any) => {
        setTrackingOrder(order);
        startTracking(order.id);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20">
            <Navbar onLogout={() => { localStorage.clear(); navigate('/login'); }} />
            <main className="max-w-4xl mx-auto px-6 py-12">
                <h2 className="text-2xl font-black text-gray-800 italic uppercase mb-10">Mis Pedidos</h2>

                {isTracking && trackingOrder && currentStatus !== OrderStatus.DELIVERED && (
                    <div className="mb-12 bg-white p-4 rounded-[40px] shadow-xl border-4 border-orange-500 animate-in fade-in zoom-in duration-500 relative">
                        <button
                            onClick={() => stopTracking()}
                            className="absolute top-6 right-6 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition-colors shadow-md"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>

                        <OrderMap
                            deliveryPos={deliveryPos}
                            destination={{
                                latitude: trackingOrder.destination_lat,
                                longitude: trackingOrder.destination_lng
                            }}
                        />
                        <p className="text-center font-black text-orange-500 mt-4 uppercase italic text-xs">
                            Sigue tu Rappi en tiempo real
                        </p>
                    </div>
                )}

                {currentStatus === OrderStatus.DELIVERED && isTracking && (
                    <div className="mb-12 bg-green-100 border-2 border-green-200 p-6 rounded-[30px] text-green-700 flex flex-col items-center animate-bounce">
                        <span className="text-3xl mb-2">✨</span>
                        <p className="font-black uppercase italic text-sm text-center">
                            ¡Tu pedido ha sido entregado con éxito! <br />
                            Disfruta tu compra
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-black uppercase italic text-xs text-gray-400">Cargando tus pedidos...</p>
                        </div>
                    ) : orders.length > 0 ? (
                        orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-black text-lg italic text-orange-500 uppercase">{order.store_name}</h3>

                                    {order.status === OrderStatus.IN_DELIVERY ? (
                                        <button
                                            onClick={() => handleTrack(order)}
                                            className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <MapPin size={14} /> Rastrear
                                        </button>
                                    ) : (
                                        <div className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-100">
                                            <span className="text-[9px] font-black uppercase text-gray-400 italic">
                                                {order.status === OrderStatus.CREATED ? "Pendiente de repartidor" : "Pedido Finalizado"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-900 p-4 rounded-2xl flex justify-between items-center text-white">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-black uppercase italic">Estado</span>
                                        <span className="font-bold text-xs uppercase italic">{order.status}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-400 font-black uppercase italic block">Total</span>
                                        <span className="font-black text-xl">${Number(order.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <Package size={48} className="text-gray-200 mb-4" />
                            <p className="font-black uppercase italic text-xs text-gray-400">No tienes pedidos registrados</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
