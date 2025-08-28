#[cfg(test)]
mod tests {
    use crate::helpers::MentorContract;
    use crate::msg::InstantiateMsg;
    use cosmwasm_std::testing::MockApi;
    use cosmwasm_std::{Addr, Coin, Empty, Uint128};
    use cw_multi_test::{App, AppBuilder, Contract, ContractWrapper, Executor};

    pub fn contract_template() -> Box<dyn Contract<Empty>> {
        let contract = ContractWrapper::new(
            crate::contract::execute,
            crate::contract::instantiate,
            crate::contract::query,
        );
        Box::new(contract)
    }

    const USER: &str = "USER";
    const ADMIN: &str = "ADMIN";
    const NATIVE_DENOM: &str = "denom";

    fn mock_app() -> App {
        AppBuilder::new().build(|router, _, storage| {
            router
                .bank
                .init_balance(
                    storage,
                    &MockApi::default().addr_make(USER),
                    vec![Coin {
                        denom: NATIVE_DENOM.to_string(),
                        amount: Uint128::new(1),
                    }],
                )
                .unwrap();
        })
    }

    fn proper_instantiate() -> (App, MentorContract) {
        let mut app = mock_app();
        let mentor_contract_id = app.store_code(contract_template());

        let user = app.api().addr_make(USER);
        assert_eq!(
            app.wrap().query_balance(user, NATIVE_DENOM).unwrap().amount,
            Uint128::new(1)
        );

        let msg = InstantiateMsg {};
        let mentor_contract_addr = app
            .instantiate_contract(
                mentor_contract_id,
                Addr::unchecked(ADMIN),
                &msg,
                &[],
                "test",
                None,
            )
            .unwrap();

        let mentor_contract = MentorContract(mentor_contract_addr);

        (app, mentor_contract)
    }

    mod mentor_tests {
        use super::*;
        use crate::msg::ExecuteMsg;

        #[test]
        fn create_mentor() {
            let (mut app, mentor_contract) = proper_instantiate();

            let msg = ExecuteMsg::CreateMentor {
                name: "Ivy".to_string(),
                institution: "野鸡大学".to_string(),
                department: "计算机学院".to_string(),
                avatar: Some("https://avatars.githubusercontent.com/u/103652334?v=4".to_string()),
                links: vec!["https://github.com/yuchangongzhu".to_string()],
            };
            let cosmos_msg = mentor_contract.call(msg).unwrap();
            app.execute(Addr::unchecked(USER), cosmos_msg).unwrap();
        }
    }
}
