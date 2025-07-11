<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{protected $fillable = ['title', 'ticket_price', 'start_time', 'end_time', 'description','event_image'];
    public function bookings()
    {
        
        return $this->hasMany(Booking::class);
    }
}
