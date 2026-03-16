import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { loadScript } from '@paypal/paypal-js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const API_BASE = import.meta.env.VITE_API_BASE || '';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export function StripePaymentExample() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!STRIPE_KEY) {
      setMessage('[خارج نطاق البيانات الموثقة]');
      return;
    }

    let mounted = true;
    (async () => {
      const s = await loadStripe(STRIPE_KEY as string);
      if (!mounted || !s) return;
      const el = s.elements();
      const card = el.create('card');
      card.mount(cardRef.current!);
      setStripe(s);
      setElements(el);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!API_BASE) return setMessage('[خارج نطاق البيانات الموثقة]');
    if (!elements || !stripe) return setMessage('Stripe not initialized');

    try {
      const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000 }),
      });
      const data = await res.json();
      if (!data.clientSecret) return setMessage('No clientSecret returned');

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement('card') },
      });

      if (result.error) setMessage(`Error: ${result.error.message}`);
      else if (result.paymentIntent && result.paymentIntent.status === 'succeeded')
        setMessage('Payment succeeded');
      else setMessage('Payment processing');
    } catch (err) {
      setMessage('Payment request failed');
    }
  }

  return (
    <div>
      <h3>Stripe Example</h3>
      <div ref={cardRef} />
      <button onClick={handlePay}>Pay $10</button>
      <div>{message}</div>
    </div>
  );
}

export function PayPalButtonExample() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) {
      setMessage('[خارج نطاق البيانات الموثقة]');
      return;
    }

    let mounted = true;
    loadScript({ 'client-id': PAYPAL_CLIENT_ID as string, currency: 'USD' })
      .then((paypal) => {
        if (!mounted || !paypal || !containerRef.current) return;
        paypal.Buttons({
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{ amount: { value: '10.00' } }],
            });
          },
          onApprove: (_data: any, actions: any) => {
            return actions.order.capture().then(function () {
              setMessage('PayPal payment captured');
            });
          },
          onError: (err: any) => setMessage('PayPal error'),
        }).render(containerRef.current);
      })
      .catch(() => setMessage('PayPal script load failed'));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h3>PayPal Example</h3>
      <div ref={containerRef} />
      <div>{message}</div>
    </div>
  );
}

export default function PaymentExamples() {
  return (
    <div>
      <StripePaymentExample />
      <PayPalButtonExample />
    </div>
  );
}
