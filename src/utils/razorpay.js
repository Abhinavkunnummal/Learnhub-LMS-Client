// Open Real Razorpay Checkout Popup
export const openRealRazorpayCheckout = ({
  amount,
  currency = "INR",
  keyId,
  orderId,
  course,
  user,
  onSuccess,
  onFailure,
}) => {
  if (!window.Razorpay) {
    if (onFailure) {
      onFailure(new Error("Razorpay SDK could not be loaded. Please check your internet connection."));
    }
    return;
  }

  const options = {
    key: keyId || "rzp_test_1DP5mmOlF5G5ag", // Standard Razorpay test key
    amount: amount, // in paise
    currency: currency || "INR",
    name: "LearnHub LMS",
    description: `Enrollment for ${course?.title || "Course"}`,
    prefill: {
      name: user?.name || "Student",
      email: user?.email || "student@example.com",
      contact: "9999999999",
    },
    notes: {
      courseId: course?._id || course?.id,
      courseTitle: course?.title,
      instructorShare: `$${((course?.price || 0) * 0.8).toFixed(2)} (80%)`,
      adminShare: `$${((course?.price || 0) * 0.2).toFixed(2)} (20%)`,
    },
    theme: {
      color: "#4f46e5",
    },
    handler: function (response) {
      // 1. SUCCESS CONDITION
      console.log("Razorpay Success Handler Triggered:", response);
      if (onSuccess) {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
          razorpay_order_id: response.razorpay_order_id || orderId || `order_${Date.now()}`,
          razorpay_signature: response.razorpay_signature || `sig_${Date.now()}`,
        });
      }
    },
    modal: {
      ondismiss: function () {
        // 2. BACK / CANCEL CONDITION
        console.log("Razorpay Modal Dismissed / Cancelled by user");
        if (onFailure) {
          onFailure({
            cancelled: true,
            message: "Payment cancelled: You closed the payment window. No charges were made.",
          });
        }
      },
    },
  };

  // Only pass order_id if it is a real cloud order ID from Razorpay
  if (orderId && !orderId.startsWith("order_test_")) {
    options.order_id = orderId;
  }

  try {
    const rzp = new window.Razorpay(options);

    // 3. FAILURE CONDITION (e.g. Card Declined, Bank Failure, OTP Failed)
    rzp.on("payment.failed", function (response) {
      console.error("Razorpay Payment Failed Event:", response.error);
      if (onFailure) {
        onFailure({
          failed: true,
          error: response.error,
          message:
            response.error?.description ||
            response.error?.reason ||
            "Payment failed: Your transaction was declined by the bank.",
        });
      }
    });

    rzp.open();
  } catch (err) {
    console.error("Error opening Razorpay checkout:", err);
    if (onFailure) {
      onFailure(err);
    }
  }
};
