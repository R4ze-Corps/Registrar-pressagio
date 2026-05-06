import { createEvent } from "../index.js";
import { configCentral } from "#functions";

export default createEvent({
    name: "autoRoleOnJoin",
    event: "guildMemberAdd",
    async run(member) {
        const roleId = configCentral.cargos.temporario;
        const role = member.guild.roles.cache.get(roleId);
        
        if (role) {
            await member.roles.add(role).catch(console.error);
        }
    }
});
