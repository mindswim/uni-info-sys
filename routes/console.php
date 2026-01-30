<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Schedule waitlist promotion checks every 5 minutes during peak registration periods
Schedule::command('waitlists:check')->everyFiveMinutes();

// Process overdue invoices and manage financial holds daily
Schedule::job(new \App\Jobs\ProcessOverdueInvoices)->daily();
