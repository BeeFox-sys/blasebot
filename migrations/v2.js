/* eslint-disable */

module.exports = {
    async up (db) {

        // Channel Migration

        await db.createCollection("channels");

        const bulkChannel = db.collection("channels").initializeOrderedBulkOp();

        const bets = await db.collection("bets").find()
            .toArray();

        for (let index = 0; index < bets.length; index++) {

            const doc = bets[index];

            await bulkChannel.find({"channel_id": doc.channel_id}).upsert()
                .updateOne({
                    "$set": {"channel_id": doc.channel_id,
                        "guild_id": doc.guild_id,
                        "sub_bets": true,
                        "bet_interval": 1},
                    "$setOnInsert": {
                        "commands_enabled": true,
                        "sub_weather": false,
                        "sub_items": false,
                        "sub_modifications": false,
                        "sub_changes": false,
                        "sub_takeover": false,
                        "sub_incineration": false,
                        "sub_misc": false
                    }
                }, {"upsert": true});
        
        }

        const events = await db.collection("events").find()
            .toArray();

        for (let index = 0; index < events.length; index++) {

            const doc = events[index];
            
            await bulkChannel.find({"channel_id": doc.channel_id}).upsert()
                .updateOne({
                    "$set": {"channel_id": doc.channel_id,
                        "guild_id": doc.guild_id,
                        "sub_weather": true,
                        "sub_items": true,
                        "sub_modifications": true,
                        "sub_changes": true,
                        "sub_takeover": true,
                        "sub_incineration": true,
                        "sub_misc": true},
                    "$setOnInsert": {
                        "commands_enabled": true,
                        "sub_bets": false,
                        "bet_interval": 1
                    }
                }, {"upsert": true});

        }

        await bulkChannel.execute();


        // Team Migration

        db.createCollection("team_subscriptions");

        const bulkTeam = db.collection("team_subscriptions").initializeOrderedBulkOp();

        const compacts = await db.collection("compacts").find()
            .toArray();

        for (let index = 0; index < compacts.length; index++) {

            const doc = compacts[index];
            
            await bulkTeam.find({
                "channel_id": doc.channel_id,
                "guild_id": doc.guild_id,
                "team_id": doc.team
            }).upsert()
                .updateOne({
                    "$set": {
                        "sub_scores": true
                    },
                    "$setOnInsert": {
                        "sub_summaries": false,
                        "sub_player_changes": false,
                        "sub_items": false,
                        "sub_flavour": false,
                        "sub_plays": false
                    }
                });
        
        }

        const summaries = await db.collection("summaries").find()
            .toArray();

        for (let index = 0; index < summaries.length; index++) {

            const doc = summaries[index];
            
            await bulkTeam.find({
                "channel_id": doc.channel_id,
                "guild_id": doc.guild_id,
                "team_id": doc.team
            }).upsert()
                .updateOne({
                    "$set": {
                        "sub_summaries": true
                    },
                    "$setOnInsert": {
                        "sub_scores": false,
                        "sub_player_changes": false,
                        "sub_items": false,
                        "sub_flavour": false,
                        "sub_plays": false
                    }
                });
        
        }

        const subscriptions = await db.collection("subscriptions").find()
            .toArray();

        for (let index = 0; index < subscriptions.length; index++) {

            const doc = subscriptions[index];
            
            await bulkTeam.find({
                "channel_id": doc.channel_id,
                "guild_id": doc.guild_id,
                "team_id": doc.team
            }).upsert()
                .updateOne({
                    "$set": {
                        "sub_scores": true,
                        "sub_player_changes": true,
                        "sub_items": true,
                        "sub_flavour": true,
                        "sub_plays": true
                    },
                    "$setOnInsert": {
                        "sub_summaries": false
                    }
                });
        
        }


        await bulkTeam.execute();

        await db.collection("guilds")
            .updateMany({}, {"$rename": {"forbidden": "forbidden_knowledge"}});

    },

    down (db) {

        db.collection("channels").drop();
        db.collection("team_subscriptions").drop();
        db.collection("guilds").updateMany({}, {"$rename": {"forbidden_knowledge": "forbidden"}});
    
    }
};
