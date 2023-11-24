let duration = 30; // Duration in seconds
  const timerDisplay = $("#timer");
  const resendOtp = $("#resendOTP");

  function updateTimer() {
    const minutes = Math.floor(duration / 60);
    let seconds = duration % 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerDisplay.text(`${minutes}:${seconds}`);

    if (duration === 0) {
      clearInterval(countdown);
      timerDisplay.text("00:00");
      resendOtp.css("display", "block");
    } else {
      duration--;
    }
  }


  // Initial call to display the full minute
  updateTimer();

  // Set up the countdown
  const countdown = setInterval(updateTimer,1000);