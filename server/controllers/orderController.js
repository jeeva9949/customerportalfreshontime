const { Order, OrderItem, Product, Customer, sequelize } = require('../models'); // IMPORTANT: Added Customer model
const { getIO } = require('../socket');

// Create a new order (checkout)
exports.createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { cartItems } = req.body;
        const customerId = req.user.id;

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
            status: 'Pending' // Explicitly set status
        }, { transaction });

        for (const itemData of orderItemsData) {
            await OrderItem.create({
                ...itemData,
                orderId: newOrder.id
            }, { transaction });

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


// --- THIS IS THE CORRECTED FUNCTION ---
// It now fetches all orders for an Admin, and specific orders for a Customer.
exports.getOrders = async (req, res) => {
    try {
        const { id, role } = req.user;
        let queryOptions = {
            include: [
                {
                    model: OrderItem,
                    include: [Product]
                },
                {
                    model: Customer, // Include customer details with the order
                    attributes: ['name'] // Only fetch the customer's name
                }
            ],
            order: [['createdAt', 'DESC']]
        };

        // If the user is a customer, only show their orders.
        if (role === 'Customer') {
            queryOptions.where = { customerId: id };
        }
        // If the user is an Admin, the 'where' clause is omitted, fetching all orders.

        const orders = await Order.findAll(queryOptions);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};
