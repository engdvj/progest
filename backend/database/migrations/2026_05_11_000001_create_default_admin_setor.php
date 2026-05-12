<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateDefaultAdminSetor extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('unidades') || !Schema::hasTable('setores')) {
            return;
        }

        DB::table('unidades')->updateOrInsert(
            ['nome' => 'PROGEST ADMINISTRACAO'],
            [
                'status' => 'A',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $unidadeId = DB::table('unidades')
            ->where('nome', 'PROGEST ADMINISTRACAO')
            ->value('id');

        if (!$unidadeId) {
            return;
        }

        DB::table('setores')->updateOrInsert(
            [
                'unidade_id' => $unidadeId,
                'nome' => 'ADMINISTRACAO',
            ],
            [
                'descricao' => 'Setor administrativo padrao do sistema.',
                'status' => 'A',
                'estoque' => false,
                'tipo' => 'Material',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    public function down()
    {
        if (!Schema::hasTable('unidades') || !Schema::hasTable('setores')) {
            return;
        }

        $unidadeId = DB::table('unidades')
            ->where('nome', 'PROGEST ADMINISTRACAO')
            ->value('id');

        if (!$unidadeId) {
            return;
        }

        DB::table('setores')
            ->where('unidade_id', $unidadeId)
            ->where('nome', 'ADMINISTRACAO')
            ->delete();

        $hasSetores = DB::table('setores')
            ->where('unidade_id', $unidadeId)
            ->exists();

        if (!$hasSetores) {
            DB::table('unidades')->where('id', $unidadeId)->delete();
        }
    }
}
