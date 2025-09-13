import React, { useEffect, useRef } from "react";

const RazorpayButton = () => {
  const formRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", "pl_QLoa7aIgLYEs7V");
    script.async = true;

    if (formRef.current) {
      formRef.current.innerHTML = ""; // Clear any existing script
      formRef.current.appendChild(script);
    }
  }, []);

  return (
    <form ref={formRef} />
  );
};

export default RazorpayButton;
