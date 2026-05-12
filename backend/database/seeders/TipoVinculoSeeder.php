<?php

namespace Database\Seeders;

use App\Models\TipoVinculo;
use Illuminate\Database\Seeder;

class TipoVinculoSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            ['nome' => 'Efetivo', 'descricao' => 'Servidor Efetivo'],
            ['nome' => 'Contrato', 'descricao' => 'Servidor Contratado'],
            ['nome' => 'Temporário', 'descricao' => 'Servidor Temporário'],
            ['nome' => 'Estagiário', 'descricao' => 'Servidor Estagiário'],
            ['nome' => 'Terceirizado', 'descricao' => 'Servidor Terceirizado'],
            ['nome' => 'Residente', 'descricao' => 'Servidor Residente'],
        ];

        foreach ($tipos as $tipo) {
            TipoVinculo::updateOrCreate(
                ['nome' => $tipo['nome']],
                [
                    'descricao' => $tipo['descricao'],
                    'status' => 'A',
                ]
            );
        }
    }
}
