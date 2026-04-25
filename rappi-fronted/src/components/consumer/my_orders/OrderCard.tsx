
interface OrderCardProps {
    item: {
        name: string;
        quantity: number;
        price: number;
        imageurl?: string;
        deliveryid?: string | null;
    };
}

export const OrderCard = ({ item }: OrderCardProps) => {
    const isAccepted = !!item.deliveryid;

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all group mb-3">
            <div className="flex items-center gap-4">
                {/* Imagen del Producto */}
                <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shadow-inner border border-gray-50">
                    <img
                        src={item.imageurl || "https://via.placeholder.com/150"}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>

                <div>
                    <h4 className="font-black text-gray-800 text-sm uppercase tracking-tight leading-tight">
                        {item.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tighter">
                        Cantidad: {item.quantity}
                    </p>
                    <p className="text-orange-500 font-black text-sm">
                        ${Number(item.price).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="text-right shrink-0">
                <p className="text-[8px] text-gray-400 font-black uppercase mb-1 tracking-tighter leading-none">
                    REPARTIDOR
                </p>
                <div className={`px-4 py-1 rounded-full font-black text-[9px] tracking-widest inline-block ${
                    isAccepted
                    ? 'bg-green-100 text-green-600 border border-green-200'
                    : 'bg-red-50 text-red-500 border border-red-100'
                }`}>
                    {isAccepted ? 'ASIGNADO' : 'BUSCANDO'}
                </div>
            </div>
        </div>
    );
};
