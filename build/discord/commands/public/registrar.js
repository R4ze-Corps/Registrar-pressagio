import { createCommand, createResponder } from "#base";
import { validateNome, validateTelefone } from "../../../validators/registro.js";
import { ResponderType } from "@constatic/base";
import { createContainer } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, TextDisplayBuilder } from "discord.js";
let registrarSessions = new Map();
createCommand({
    name: "registrar",
    description: "Inicia o sistema de registro.",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.reply(await registrarMenu());
    }
});
// Handlers for approval/denial actions on evaluation message
createResponder({
    customId: "approve-registro",
    types: ["Button"], cache: "cached",
    async run(interaction) {
        try {
            const msg = interaction.message;
            const container = msg.components?.[0];
            const textDisplay = container?.components?.find((c) => c.type === 10);
            const session = registrarSessions.get(msg.id);
            if (session) {
                const { candidateId, candidateName, userId } = session;
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (member) {
                    const newNickname = `${candidateId} | ${candidateName}`;
                    await member.setNickname(newNickname).catch(() => { });
                    await member.roles.add("1500609726956699718").catch(() => { });
                    await member.roles.add("1501190054377295984").catch(() => { });
                    console.debug(`[registrar] approved: renamed "${newNickname}" and added roles to ${userId}`);
                }
            }
            if (textDisplay) {
                const text = textDisplay.content || "";
                const updatedText = text.replace(/(\*\*STATUS:\*\* )Aguardando/, `$1Aprovado\n**APROVADO POR:** <@${interaction.user.id}>`);
                const newContainer = {
                    type: 17,
                    components: [{ type: 10, content: updatedText }]
                };
                await msg.edit({ components: [newContainer], flags: ["IsComponentsV2"] });
            }
            await interaction.reply({ content: "Registro aprovado.", ephemeral: true });
        }
        catch (err) {
            console.error(`[registrar] approve error:`, err);
            await interaction.reply({ content: "Registro aprovado.", ephemeral: true });
        }
    }
});
createResponder({
    customId: "deny-registro",
    types: ["Button"], cache: "cached",
    async run(interaction) {
        try {
            const msg = interaction.message;
            const container = msg.components?.[0];
            const textDisplay = container?.components?.find((c) => c.type === 10);
            if (textDisplay) {
                const text = textDisplay.content || "";
                const updatedText = text.replace(/(\*\*STATUS:\*\* )Aguardando/, `$1Negado\n**NEGADO POR:** <@${interaction.user.id}>`);
                const newContainer = {
                    type: 17,
                    components: [{ type: 10, content: updatedText }]
                };
                await msg.edit({ components: [newContainer], flags: ["IsComponentsV2"] });
            }
            await interaction.reply({ content: "Registro negado.", ephemeral: true });
        }
        catch (err) {
            console.error(`[registrar] deny error:`, err);
            await interaction.reply({ content: "Registro negado.", ephemeral: true });
        }
    }
});
async function registrarMenu() {
    const text = "## Bem-vindo ao Sistema de Registro\nPara fazer sua liberação, precisamos de algumas informações suas.\n\nPor favor, clique no botão abaixo para abrir o formulário e preencher o seu Nome, ID e Telefone.";
    // Removido: seleção de recrutadores. O recrutador será informado por digitação no modal (etapa 3)
    const container = createContainer("#2b2d31", new TextDisplayBuilder().setContent(text), new ActionRowBuilder().addComponents(new ButtonBuilder({
        customId: "btn-abrir-registro",
        label: "📝 Registrar",
        style: ButtonStyle.Success
    })));
    return {
        flags: ["IsComponentsV2"],
        components: [container]
    };
}
createResponder({
    customId: "btn-abrir-registro",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction) {
        // Novo fluxo: não listar recrutadores; o recrutador é digitado no modal (etapa 3)
        const modal = new ModalBuilder({
            customId: "modal-registro",
            title: "Formulário de Registro"
        });
        const inputNome = new ActionRowBuilder().addComponents(new TextInputBuilder({
            customId: "input-nome",
            label: "NOME",
            style: TextInputStyle.Short,
            required: true,
            placeholder: "Ex: João"
        }));
        const inputRecrutador = new ActionRowBuilder().addComponents(new TextInputBuilder({
            customId: "input-recrutador",
            label: "RECRUTADOR",
            style: TextInputStyle.Short,
            required: true,
            placeholder: "Ex: Fulano da Silva"
        }));
        const inputId = new ActionRowBuilder().addComponents(new TextInputBuilder({
            customId: "input-id",
            label: "ID",
            style: TextInputStyle.Short,
            required: true,
            placeholder: "Ex: 12345"
        }));
        const inputTelefone = new ActionRowBuilder().addComponents(new TextInputBuilder({
            customId: "input-telefone",
            label: "TELEFONE",
            style: TextInputStyle.Short,
            required: true,
            placeholder: "Ex: 000-000"
        }));
        modal.addComponents(inputNome, inputRecrutador, inputId, inputTelefone);
        await interaction.showModal(modal);
    },
});
createResponder({
    customId: "modal-registro",
    types: [ResponderType.ModalComponent], cache: "cached",
    async run(interaction) {
        const nome = interaction.fields.getTextInputValue("input-nome");
        const recruiterName = interaction.fields.getTextInputValue("input-recrutador");
        const id = interaction.fields.getTextInputValue("input-id");
        const telefone = interaction.fields.getTextInputValue("input-telefone");
        // Retrieve previously selected user (if any) for the session using invoker's id as key
        const sessionKey = interaction.user.id;
        const selectedUser = registrarSessions.get(sessionKey)?.selectedUser;
        console.debug(`[registrar] modal-registro: selectedUser=${selectedUser ?? 'none'}, recruiter=${recruiterName ?? 'none'}`);
        // Validações
        if (!validateNome(nome)) {
            await interaction.reply({ content: "Nome inválido. Use apenas letras em um único nome.", flags: ["Ephemeral"] });
            return;
        }
        if (!/^[\d]+$/.test(id)) {
            await interaction.reply({ content: "ID inválido. Use apenas números.", flags: ["Ephemeral"] });
            return;
        }
        if (!validateTelefone(telefone)) {
            await interaction.reply({ content: "Telefone inválido. Formato permitido: 0, 00, 000, 000-000 (ou 6 dígitos como 000000).", flags: ["Ephemeral"] });
            return;
        }
        const userInfo = (recruiterName ? `\n\nRecrutador: ${recruiterName}` : "") + (selectedUser ? `\n\nUsuário selecionado: <@${selectedUser}>` : "");
        await interaction.reply({
            content: `✅ Registro recebido com sucesso!\n\n**Nome:** ${nome}\n**ID:** ${id}\n**Telefone:** ${telefone}${userInfo}\n\n*Aguarde a liberação pela nossa equipe!*`,
            flags: ["Ephemeral"]
        });
        // Enviar formulário para avaliação no canal específico
        try {
            console.debug(`[registrar] fetching channel 1501047777021526127`);
            const channel = await interaction.client.channels.fetch("1501047777021526127");
            console.debug(`[registrar] channel fetched: ${channel?.type}, isTextBased: ${channel?.isTextBased?.()}`);
            if (channel?.isTextBased?.()) {
                const header = `## Novo Registro Para Avaliação\n\n**CANDIDATO:** <@${interaction.user.id}>\n**NOME:** ${nome}\n**ID:** ${id}\n**TELEFONE:** ${telefone}\n**RECRUTADOR:** ${recruiterName || "N/A"}\n**STATUS:** Aguardando`;
                const approveButton = new ButtonBuilder().setCustomId("approve-registro").setLabel("Aprovar").setStyle(ButtonStyle.Success);
                const denyButton = new ButtonBuilder().setCustomId("deny-registro").setLabel("Negar").setStyle(ButtonStyle.Danger);
                const row = new ActionRowBuilder().addComponents(approveButton, denyButton);
                const panel = createContainer("#2b2d31", new TextDisplayBuilder().setContent(header), row);
                console.debug(`[registrar] sending evaluation message to channel`);
                const sent = await channel.send({ components: [panel], flags: ["IsComponentsV2"] });
                console.debug(`[registrar] message sent: ${sent?.id}`);
                registrarSessions.set(sent.id, { candidateId: id, candidateName: nome, userId: interaction.user.id });
            }
        }
        catch (err) {
            console.error(`[registrar] failed to send evaluation message:`, err);
        }
    }
});
// Handle user selection from the modal flow (outside the modal, as modal cannot embed a user select)
createResponder({
    customId: "select-registro-user",
    // Some library versions expect a string literal for the type instead of the enum value
    types: ["SelectMenu"], cache: "cached",
    async run(interaction) {
        try {
            const value = interaction.values?.[0];
            const [registrantId, recruiterId] = String(value).split("|");
            console.debug(`[registrar] select-registro-user: registrant=${registrantId} recruiter=${recruiterId}`);
            // Map selection to registrant's session
            const existing = registrarSessions.get(registrantId) ?? {};
            existing.selectedUser = recruiterId;
            registrarSessions.set(registrantId, existing);
            // Show modal now that recruiter is selected for this registrant
            const modal = new ModalBuilder({
                customId: "modal-registro",
                title: "Formulário de Registro"
            });
            const inputNome = new ActionRowBuilder().addComponents(new TextInputBuilder({
                customId: "input-nome",
                label: "NOME",
                style: TextInputStyle.Short,
                required: true,
                placeholder: "Ex: João Silva"
            }));
            const inputRecrutador = new ActionRowBuilder().addComponents(new TextInputBuilder({
                customId: "input-recrutador",
                label: "RECRUTADOR",
                style: TextInputStyle.Short,
                required: true,
                placeholder: "Ex: Fulano da Silva"
            }));
            const inputId = new ActionRowBuilder().addComponents(new TextInputBuilder({
                customId: "input-id",
                label: "ID",
                style: TextInputStyle.Short,
                required: true,
                placeholder: "Ex: 12345"
            }));
            const inputTelefone = new ActionRowBuilder().addComponents(new TextInputBuilder({
                customId: "input-telefone",
                label: "TELEFONE",
                style: TextInputStyle.Short,
                required: true,
                placeholder: "Ex: 000-000"
            }));
            modal.addComponents(inputNome, inputRecrutador, inputId, inputTelefone);
            await interaction.showModal(modal);
        }
        catch (err) {
            try {
                await interaction.reply({ content: "Não foi possível processar a seleção do recrutador. Tente novamente.", ephemeral: true });
            }
            catch {
                // ignore
            }
        }
    }
});
