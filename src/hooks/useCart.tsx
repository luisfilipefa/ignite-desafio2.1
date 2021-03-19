import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@Rocketshoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productInCart = cart.find((item) => item.id === productId);

      if (!productInCart) {
        const productData = await api.get<Product>(`products/${productId}`);
        const productInfo = productData.data;

        const updatedCart = [...cart, { ...productInfo, amount: 1 }];
        setCart(updatedCart);
        localStorage.setItem("@Rocketshoes:cart", JSON.stringify(updatedCart));

        toast.success("Produto adicionado.");
      } else {
        updateProductAmount({ productId, amount: 1 });
      }
    } catch {
      // TODO
      toast.error("Erro na adição do produto.");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const updatedCart = cart.filter((product) => product.id !== productId);
      setCart(updatedCart);
      localStorage.setItem("@Rocketshoes:cart", JSON.stringify(updatedCart));
      toast.success("Produto removido.");
    } catch {
      // TODO
      toast.error("Erro na remoção do produto.");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const update = () => {
        const updatedCart = cart.map((product) => {
          if (product.id === productId) {
            return { ...product, amount: product.amount + amount };
          }

          return product;
        });
        setCart(updatedCart);
        localStorage.setItem("@Rocketshoes:cart", JSON.stringify(updatedCart));

        toast.success("Quantidade atualizada com sucesso.");
      };

      const selectedProduct = cart.find((product) => product.id === productId);

      const stockData = await api.get<UpdateProductAmount>(
        `stock/${productId}`
      );
      const stockBalance = stockData.data.amount;

      if (selectedProduct) {
        if (stockBalance > selectedProduct.amount) {
          update();
        } else if (stockBalance >= selectedProduct.amount && amount < 0) {
          update();
        } else {
          toast.error("Quantidade solicitada fora de estoque.");
        }
      }
    } catch {
      // TODO
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
