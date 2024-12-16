import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createStripePaymentIntent = async (amount: number, currency: string = 'vnd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    return paymentIntent.client_secret;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create Stripe payment intent');
  }
};
