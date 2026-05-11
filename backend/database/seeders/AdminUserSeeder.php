<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::updateOrCreate(
            ['email' => 'admin@progest.com'],
            [
                'name' => 'ADMIN',
                'password' => Hash::make('admin123'),
                'telefone' => '00000000000',
                'data_nascimento' => '1990-01-01',
                'cpf' => '00000000000',
                'status' => 'A',
                'tipo_vinculo' => 1,
            ]
        );
    }
}
