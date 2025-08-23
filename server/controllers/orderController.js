const { Order, OrderItem, Product, sequelize } = require('../models');
const { getIO } = require('../socket');

// Create a new order (checkout)
exports.createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { cartItems } = req.body; // Expects an array of { productId, quantity }
        const customerId = req.user.id; // From 'protect' middleware

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of cartItems) {
            const product = await Product.findByPk(item.productId);
            if (!product || product.stock < item.quantity) {
                throw new Error(`Product ${product.name} is out of stock.`);
            }
            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
        }

        const newOrder = await Order.create({
            customerId,
            totalAmount,
        }, { transaction });

        for (const itemData of orderItemsData) {
            await OrderItem.create({
                ...itemData,
                orderId: newOrder.id
            }, { transaction });

            // Decrement stock
            await Product.decrement('stock', {
                by: itemData.quantity,
                where: { id: itemData.productId },
                transaction
            });
        }

        await transaction.commit();
        getIO().emit('orders_updated');
        getIO().emit('products_updated');
        res.status(201).json(newOrder);

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// Get orders for the logged-in customer
exports.getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.user.id;
        const orders = await Order.findAll({
            where: { customerId },
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};
