import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductsByStore, createOrder, getStores } from '../../services/order.service';
import type { Product } from '../../types/products.types';
import type { Lating } from '../../types/orders.types';

import { Navbar } from '../../components/consumer/landing/ConsumerNavbar';
import { ProductCard } from '../../components/consumer/store_detail/ProductCard';
import { CartSidebar } from '../../components/consumer/store_detail/CartSidebar';
import { OrderMapPicker } from '../../components/consumer/store_detail/OrderMapPicker';

export interface CartItem extends Product {
    quantity: number;
}

export default function StoreDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [storeName, setStoreName] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedPos, setSelectedPos] = useState<Lating | null>(null);

    const userid = localStorage.getItem('userid');

    useEffect(() => {
        if (!id) {
            navigate('/consumer');
            return;
        }

        const loadData = async () => {
            try {
                const [productsData, allStores] = await Promise.all([
                    getProductsByStore(id),
                    getStores()
                ]);
                setProducts(productsData);
                const currentStore = allStores.find(s => s.id === id);
                if (currentStore) setStoreName(currentStore.name);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleFinalize = async () => {
        if (!selectedPos) {
            alert("¡Error! Tienes que marcar en el mapa dónde quieres recibir tu pedido 📍");
            return;
        }

        if (!userid) return alert("Sesión expirada");

        const orderData = {
            consumerid: userid,
            storeid: id!,
            total: total,
            items: cart.map(item => ({
                productid: item.id,
                quantity: item.quantity,
                priceattime: item.price
            })),
            destination: selectedPos
        };

        try {
            await createOrder(orderData);
            alert("Pedido enviado con éxito 🚀");
            navigate('/orders');
        } catch (error) {
            alert("No se pudo crear el pedido");
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar onLogout={() => { localStorage.clear(); navigate('/login'); }} />

            <main className="max-w-6xl mx-auto px-6 py-10">
                <header className="mb-10">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-800">
                        {storeName || "Tienda"}
                    </h2>
                    <p className="text-orange-500 font-bold uppercase text-xs tracking-widest mt-2">Menú Seleccionado</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-8">

                        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-800 mb-4 uppercase italic">¿Dónde entregamos?</h3>
                            <OrderMapPicker
                                selectedPosition={selectedPos}
                                onPositionSelected={setSelectedPos}
                            />
                        </div>

                        <div className="grid gap-4">
                            {products.map(p => (
                                <ProductCard key={p.id} product={p} onAdd={addToCart} />
                            ))}
                        </div>
                    </div>

                    <aside className="lg:w-96 sticky top-28 h-fit">
                        <CartSidebar
                            cart={cart}
                            total={total}
                            onRemove={removeFromCart}
                            onFinalize={handleFinalize}
                        />
                    </aside>
                </div>
            </main>
        </div>
    );
}
