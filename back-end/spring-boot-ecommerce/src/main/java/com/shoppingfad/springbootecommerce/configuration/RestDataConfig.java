package com.shoppingfad.springbootecommerce.configuration;

import com.shoppingfad.springbootecommerce.entities.Country;
import com.shoppingfad.springbootecommerce.entities.Product;
import com.shoppingfad.springbootecommerce.entities.ProductCategory;
import com.shoppingfad.springbootecommerce.entities.State;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;

import javax.persistence.EntityManager;
import javax.persistence.metamodel.EntityType;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;


@Configuration
public class RestDataConfig  implements RepositoryRestConfigurer {

    private EntityManager entityManager;
    @Autowired
    public RestDataConfig(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config){
        HttpMethod[] theUnsupportedActions={HttpMethod.POST,HttpMethod.DELETE,HttpMethod.PUT};
        disableHttpMethods(Product.class,config, theUnsupportedActions);
        disableHttpMethods(ProductCategory.class,config, theUnsupportedActions);
        disableHttpMethods(State.class,config, theUnsupportedActions);
        disableHttpMethods(Country.class,config, theUnsupportedActions);

        // call an internal helper method
        exposeIds(config);
    }

    private void disableHttpMethods(Class theClass,RepositoryRestConfiguration config, HttpMethod[] theUnsupportedActions) {
        config.getExposureConfiguration()
                .forDomainType(theClass)
                .withItemExposure(((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions)))
                .withCollectionExposure(((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions)));
    }

    private void exposeIds(RepositoryRestConfiguration config) {
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();

        // - create an array of the entity types
        List<Class> entityClasses = new ArrayList<>();

        // - get the entity types for the entities
        for (EntityType tempEntityType : entities) {
            entityClasses.add(tempEntityType.getJavaType());
        }

        // - expose the entity ids for the array of entity/domain types
        Class[] domainTypes = entityClasses.toArray(new Class[0]);
        config.exposeIdsFor(domainTypes);
    }
}
