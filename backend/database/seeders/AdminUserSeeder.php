<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        // Usa cpf como chave pois o email pode ter mudado em deploys anteriores
        DB::table('users')->updateOrInsert(
            ['cpf' => '00000000000'],
            [
                'email' => 'admin@progest.com',
                'name' => 'ADMIN',
                'password' => Hash::make('admin123'),
                'telefone' => '00000000000',
                'data_nascimento' => '1990-01-01',
                'status' => 'A',
                'tipo_vinculo' => 1,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }
}
