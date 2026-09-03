<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }


    /**
     * Get the message envelope.
     */
    public function build()
    {
        $resetLink = config('app.url') . '/reset/password/' . $this->token;
        return $this->subject('Reset Your Password')
                    ->view('emails.forgot_password')
                    ->with(['resetLink' => $resetLink]);
    }
}
