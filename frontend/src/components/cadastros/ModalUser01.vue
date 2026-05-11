<script setup>
import { computed, ref, watch, getCurrentInstance, onMounted } from "vue";
import { useStore } from "vuex";
import CadastroDialog from "@/components/layouts/CadastroDialog.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Funcoes from "@/functions/cad_usuarios.js";
import { listarSetores } from "@/functions/cad_setores.js";

const props = defineProps(["idModal", "functions"]);
const store = useStore();
const { proxy } = getCurrentInstance();

const localData = ref({
  id: null,
  status: "A",
  tipo_vinculo: "",
  name: "",
  cpf: "",
  email: "",
  telefone: "",
  data_nascimento: "",
  password: "",
  Setores_ids: [],
});

const modalDataStore = computed(() => store.state.modalData.modalData);
const modalFunction = computed(() => store.state.modalData.modalFunction);
const listTiposVinculoStore = computed(
  () => store.state.listTiposVinculo || [],
);
const isModalOpen = computed({
  get: () => store.state.modalData.isModalOpen,
  set: (value) => store.commit("setModalOpen", value),
});

// Erros de validação vindos do backend (normalizados pelo interceptor)
const modalErrors = computed(() => store.state.modalErrors || {});
const setoresOptions = ref([]);
const loadingSetores = ref(false);

// Função auxiliar para verificar se um campo tem erro
const hasError = (campo) => !!modalErrors.value[campo];
const getError = (campo) =>
  modalErrors.value[campo] ? modalErrors.value[campo][0] : "";
const isSuperAdminEmail = (email) =>
  ["admin@admin.com", "admin@progest.com"].includes(
    email?.toString().toLowerCase(),
  );

const isSuperAdminUsuario = computed(
  () => isSuperAdminEmail(localData.value.email) || !!localData.value.is_admin,
);

const normalizeSetoresVinculados = (setores = []) =>
  (Array.isArray(setores) ? setores : [])
    .map((setor) => ({
      id: String(setor.id || setor.setor_id),
      perfil: setor.perfil || setor.pivot?.perfil || "solicitante",
    }))
    .filter(
      (setor) => setor.id && setor.id !== "undefined" && setor.id !== "null",
    );

const normalizeSetoresList = (payload) => {
  const data = payload?.data?.data || payload?.data || payload || [];
  return (Array.isArray(data) ? data : []).filter(
    (setor) => setor.status !== "I",
  );
};

const isSetorSelected = (setorId) =>
  (localData.value.Setores_ids || []).some(
    (item) => String(item.id) === String(setorId),
  );

const toggleSetor = (setorId) => {
  const id = String(setorId);
  const current = [...(localData.value.Setores_ids || [])];
  const index = current.findIndex((item) => String(item.id) === id);

  if (index >= 0) current.splice(index, 1);
  else current.push({ id, perfil: "solicitante" });

  localData.value.Setores_ids = current;
};

const getSetorPerfil = (setorId) => {
  const item = (localData.value.Setores_ids || []).find(
    (setor) => String(setor.id) === String(setorId),
  );
  return item?.perfil || "solicitante";
};

const setSetorPerfil = (setorId, perfil) => {
  const id = String(setorId);
  const current = [...(localData.value.Setores_ids || [])];
  const index = current.findIndex((item) => String(item.id) === id);

  if (index >= 0) current[index] = { ...current[index], perfil };
  else current.push({ id, perfil });

  localData.value.Setores_ids = current;
};

const loadSetores = async () => {
  loadingSetores.value = true;
  try {
    const response = await listarSetores(null, false, proxy.$axios);
    setoresOptions.value = normalizeSetoresList(response.data || response);
  } catch (e) {
    console.warn("Erro ao carregar setores:", e);
    setoresOptions.value = [];
  } finally {
    loadingSetores.value = false;
  }
};

watch(
  modalDataStore,
  (newValue) => {
    if (newValue) {
      localData.value = JSON.parse(JSON.stringify(newValue));
      if (!localData.value.status) localData.value.status = "A";
      localData.value.Setores_ids = normalizeSetoresVinculados(
        localData.value.Setores_ids ||
          localData.value.Setores ||
          localData.value.setores ||
          [],
      );
      // Converter tipo_vinculo para string (o Select usa :value="tipo.id.toString()")
      if (localData.value.tipo_vinculo != null) {
        localData.value.tipo_vinculo = String(localData.value.tipo_vinculo);
      }
    }
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  Funcoes.listTiposVinculo({ $axios: proxy.$axios, $store: store })?.catch(
    (e) => {
      console.warn("Erro ao carregar tipos de vínculo:", e);
    },
  );
});

watch(isModalOpen, (open) => {
  if (open && setoresOptions.value.length === 0 && !loadingSetores.value) {
    loadSetores();
  }
});

const handleSave = () => {
  // Limpa erros antes de submeter
  store.commit("setModalErrors", {});

  if (
    !localData.value.name ||
    !localData.value.email ||
    !localData.value.cpf ||
    !localData.value.tipo_vinculo
  ) {
    proxy.$toastr?.e("Por favor, preencha todos os campos obrigatórios (*)");
    return;
  }

  if (modalFunction.value === "ADD" && !localData.value.password) {
    proxy.$toastr?.e("Senha é obrigatória para novos usuários");
    return;
  }

  if (!isSuperAdminUsuario.value && !localData.value.Setores_ids?.length) {
    proxy.$toastr?.e("Selecione ao menos um setor para o usuario");
    return;
  }

  const content = {
    $axios: proxy.$axios,
    $store: store,
    $toastr: proxy.$toastr,
    modalData: {
      ...localData.value,
      Setores_ids: normalizeSetoresVinculados(localData.value.Setores_ids),
    },
    // Callback chamado após salvar com sucesso — fecha o modal
    onSuccess: () => {
      store.commit("setModalOpen", false);
    },
  };

  props.functions.ADD_UP(content, modalFunction.value);
};
</script>

<template>
  <CadastroDialog
    v-model:open="isModalOpen"
    :title="modalFunction === 'ADD' ? 'Cadastrar Usuário' : 'Editar Usuário'"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
      <div class="space-y-2">
        <Label for="status">Status</Label>
        <Select v-model="localData.status">
          <SelectTrigger :class="{ 'border-red-500': hasError('status') }">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Ativo</SelectItem>
            <SelectItem value="I">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="hasError('status')" class="text-xs text-destructive mt-1">
          {{ getError("status") }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="vinculo"
          >Tipo de Vínculo <span class="text-destructive">*</span></Label
        >
        <Select v-model="localData.tipo_vinculo">
          <SelectTrigger
            :class="{ 'border-red-500': hasError('tipo_vinculo') }"
          >
            <SelectValue placeholder="Selecione o vínculo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="tipo in listTiposVinculoStore"
              :key="tipo.id"
              :value="tipo.id.toString()"
            >
              {{ tipo.nome }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p
          v-if="hasError('tipo_vinculo')"
          class="text-xs text-destructive mt-1"
        >
          {{ getError("tipo_vinculo") }}
        </p>
      </div>

      <div class="space-y-2 md:col-span-1">
        <Label for="name">Nome <span class="text-destructive">*</span></Label>
        <Input
          id="name"
          v-model="localData.name"
          placeholder="Nome completo"
          :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('name') }"
        />
        <p v-if="hasError('name')" class="text-xs text-destructive mt-1">
          {{ getError("name") }}
        </p>
      </div>

      <div class="space-y-2 md:col-span-1">
        <Label for="cpf">CPF <span class="text-destructive">*</span></Label>
        <Input
          id="cpf"
          v-model="localData.cpf"
          v-mask="'###.###.###-##'"
          maxlength="14"
          placeholder="000.000.000-00"
          :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('cpf') }"
        />
        <p v-if="hasError('cpf')" class="text-xs text-destructive mt-1">
          {{ getError("cpf") }}
        </p>
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label for="email"
          >E-mail <span class="text-destructive">*</span></Label
        >
        <Input
          id="email"
          type="email"
          v-model="localData.email"
          placeholder="usuario@exemplo.com"
          :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('email') }"
        />
        <p v-if="hasError('email')" class="text-xs text-destructive mt-1">
          {{ getError("email") }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="telefone">Telefone</Label>
        <Input
          id="telefone"
          v-model="localData.telefone"
          v-mask="'(##) #####-####'"
          placeholder="(00) 00000-0000"
          :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('telefone') }"
        />
        <p v-if="hasError('telefone')" class="text-xs text-destructive mt-1">
          {{ getError("telefone") }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="nascimento">Data de Nascimento</Label>
        <Input
          id="nascimento"
          type="date"
          v-model="localData.data_nascimento"
          :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('data_nascimento') }"
        />
        <p
          v-if="hasError('data_nascimento')"
          class="text-xs text-destructive mt-1"
        >
          {{ getError("data_nascimento") }}
        </p>
      </div>

      <div class="space-y-2 md:col-span-2">
        <div class="flex items-center justify-between gap-3">
          <Label>
            Setores de acesso
            <span v-if="!isSuperAdminUsuario" class="text-destructive">*</span>
          </Label>
          <span class="text-[11px] text-muted-foreground">
            {{ localData.Setores_ids?.length || 0 }} selecionado(s)
          </span>
        </div>
        <div
          class="max-h-56 overflow-y-auto rounded-md border border-input bg-background"
          :class="{ 'border-red-500': hasError('Setores_ids') }"
        >
          <div
            v-if="loadingSetores"
            class="px-3 py-4 text-sm text-muted-foreground"
          >
            Carregando setores...
          </div>
          <div
            v-else-if="setoresOptions.length === 0"
            class="px-3 py-4 text-sm text-muted-foreground"
          >
            Nenhum setor ativo encontrado.
          </div>
          <template v-else>
            <div
              v-for="setor in setoresOptions"
              :key="setor.id"
              class="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0"
            >
              <input
                type="checkbox"
                class="h-4 w-4 shrink-0"
                :checked="isSetorSelected(setor.id)"
                @change="toggleSetor(setor.id)"
              />
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium text-foreground">
                  {{ setor.nome }}
                </div>
                <div class="truncate text-[11px] text-muted-foreground">
                  {{ setor.unidade?.nome || "Sem unidade informada" }}
                </div>
              </div>
              <Select
                :model-value="getSetorPerfil(setor.id)"
                :disabled="!isSetorSelected(setor.id)"
                @update:model-value="(value) => setSetorPerfil(setor.id, value)"
              >
                <SelectTrigger class="h-9 w-[140px]">
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="almoxarife">Almoxarife</SelectItem>
                  <SelectItem value="solicitante">Solicitante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </template>
        </div>
        <p v-if="hasError('Setores_ids')" class="text-xs text-destructive mt-1">
          {{ getError("Setores_ids") }}
        </p>
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label for="password"
          >Senha
          <span v-if="modalFunction === 'ADD'" class="text-destructive"
            >*</span
          ></Label
        >
        <Input
          id="password"
          type="password"
          v-model="localData.password"
          placeholder="Digite a senha"
          :class="{ 'border-red-500 focus-visible:ring-red-500': hasError('password') }"
        />
        <p v-if="hasError('password')" class="text-xs text-destructive mt-1">
          {{ getError("password") }}
        </p>
        <p
          v-if="modalFunction === 'UP' && !hasError('password')"
          class="text-[11px] text-muted-foreground italic"
        >
          Deixe em branco para manter a senha atual.
        </p>
      </div>
    </div>

    <template #footer="{ close }">
      <Button variant="outline" @click="close"> Fechar </Button>
      <Button @click="handleSave" class="min-w-[100px]">
        {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
      </Button>
    </template>
  </CadastroDialog>
</template>
